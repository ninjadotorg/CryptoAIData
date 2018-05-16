import base64
import requests
import json
import os
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics

from .models import Profile, Image, Product, Firmware, ImageProfile
from .serializers import ProfileSerializer, ProfileDetailSerializer, ImageDetailSerializer, ImageSerializer, \
    ProductSerializer, ProductDetailSerializer, FirmwareSerializer, FirmwareDetailSerializer, ImageProfileSerializer, \
    ImageProfileDetailSerializer

from django.conf import settings
from django.contrib.auth.models import User
from web3 import Web3, TestRPCProvider, HTTPProvider
from web3 import Account
import django_filters.rest_framework
from api.filter import ImageFilter
from api.utils.ai.ai_model_wapper import ModelWrapper


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def user_signup(request):
    if 'password' not in request.data:
        return Response({"message": "Please enter password"}, status=status.HTTP_400_BAD_REQUEST)
    data = dict(
        (key, request.data.getlist(key) if len(request.data.getlist(key)) > 1 else request.data.getlist(key)[0]) for key
        in request.data.keys())
    data['password'] = base64.b64encode(data['password'].encode()).decode()

    response = requests.post(settings.AUTONOMOUS_API_SIGNUP, data=json.dumps(data),
                             headers={'content-type': "application/json"})

    if response.status_code != 200 or response.json()['status'] != 1:
        return Response({"message": response.json().get('message')}, status=status.HTTP_400_BAD_REQUEST)

    # Auto create investor
    user = User.objects.filter(username=response.json()['customer']['email']).first()
    if not user:
        user = User.objects.create_user(username=response.json()['customer']['email'])
    profile, _ = Profile.objects.get_or_create(user=user, ref_id=response.json()['customer']['id'])
    profile.ether_address = response.json()['customer']['ether_address']
    profile.save()
    res = response.json()['customer']
    res['id'] = profile.id
    return Response(res, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def user_signin(request):
    if 'password' not in request.data:
        return Response({"message": "Please enter password"}, status=status.HTTP_400_BAD_REQUEST)
    data = dict(
        (key, request.data.getlist(key) if len(request.data.getlist(key)) > 1 else request.data.getlist(key)[0]) for key
        in request.data.keys())
    data['password'] = base64.b64encode(data['password'].encode()).decode()

    response = requests.post(settings.AUTONOMOUS_API_AUTH, data=json.dumps(data),
                             headers={'content-type': "application/json"})

    if response.status_code != 200 or response.json()['status'] != 1:
        return Response({"message": response.json().get('message')}, status=status.HTTP_400_BAD_REQUEST)

    # Auto create investor
    user = User.objects.filter(username=response.json()['customer']['email']).first()
    if not user:
        user = User.objects.create_user(username=response.json()['customer']['email'])
    profile, _ = Profile.objects.get_or_create(user=user, ref_id=response.json()['customer']['id'])
    profile.ether_address = response.json()['customer']['ether_address']
    profile.save()
    res = response.json()['customer']
    res['id'] = profile.id
    return Response(res, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def transfer(request):
    if 'to' not in request.data or 'amount' not in request.data:
        return Response({"to": ["This field may not be blank."], "amount": ["This field may not be blank."]},
                        status=status.HTTP_400_BAD_REQUEST)
    to = request.data.get('to')
    amount = int(request.data.get('amount'))

    with open(os.path.join(settings.BASE_DIR, 'earth_contract_abi.json'), 'r') as abi_definition:
        abi = json.load(abi_definition)

    w3 = Web3(HTTPProvider('https://rinkeby.infura.io/SKMV9xjeMbG3u7MnJHVH'))

    contract = w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=abi)

    unicorn_txn = contract.functions.transfer(to, amount*1000000000000000000).buildTransaction({
        'value': 0,
        'gas': w3.toHex(1000000),
        'gasPrice': w3.toWei('10000', 'gwei'),
        'nonce': w3.eth.getTransactionCount('0x6f212bF41DF64De9782dbfb26112BD3B0e39514B'),
        'from': '0x6f212bF41DF64De9782dbfb26112BD3B0e39514B'
    })

    private_key = r"955ca0f797c309aadd06d6bd9272ed71e57210ea145edff4b238c3db0b63f219"
    acct = Account.privateKeyToAccount(private_key)
    signed = acct.signTransaction(unicorn_txn)
    tx = w3.eth.sendRawTransaction(signed.rawTransaction)
    tx_hash = w3.toHex(tx)
    return Response({"tx_hash": tx_hash}, status=status.HTTP_200_OK)


class ProfileList(generics.ListCreateAPIView):
    http_method_names = ['get', 'head']
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class ImageList(generics.ListCreateAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_class = ImageFilter

    def create(self, request, *args, **kwargs):
        # Stream to server AI
        file = request.FILES['link']
        data = file.read()
        adr = "35.198.234.42"
        port = 9001
        model_spec_name = 'recycle'
        model_spec_sig = 'scores'
        image_key = 'image'
        model = ModelWrapper(adr, port, model_spec_name, model_spec_sig, image_key)
        result_model = model.predict(data)
        newdict = {'type_ai': float(result_model[0]), 'score': result_model[1]}
        file.seek(0)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        newdict.update(serializer.data)
        return Response(newdict, status=status.HTTP_201_CREATED, headers=headers)


class ImageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageDetailSerializer


class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        return Product.objects.filter(profile=user.profile)

    def perform_create(self, serializer):
        return serializer.save(profile=self.request.user.profile)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer


class FirmwareList(generics.ListCreateAPIView):
    queryset = Firmware.objects.all()
    serializer_class = FirmwareSerializer


class FirmwareDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Firmware.objects.all()
    serializer_class = FirmwareDetailSerializer


class ImageProfileList(generics.ListCreateAPIView):
    def get_queryset(self):
        user = self.request.user
        return ImageProfile.objects.filter(profile=user.profile)

    queryset = ImageProfile.objects.all()
    serializer_class = ImageProfileSerializer


class ImageProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ImageProfile.objects.all()
    serializer_class = ImageProfileDetailSerializer
