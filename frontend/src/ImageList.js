import React from 'react';
import {Grid, Image, Container, Card, Header, Form,Divider, Segment, Dropdown, Visibility, Modal, List, Button, Icon} from 'semantic-ui-react'
import {AuthConsumer} from './AuthContext'
import {Route, Redirect} from 'react-router'
import agent from './agent'
import {Link} from 'react-router-dom'
import filter from 'lodash.filter'

import {iosHeartOutline, iosHeart, iosCheckmarkOutline,  iosPlusOutline} from 'react-icons-kit/ionicons'
import { withBaseIcon } from 'react-icons-kit'
const SideIconContainer =  withBaseIcon({ size:32})

function LikedIcon(props) {
  if (!props.isAuth) {
    return (
      <Link to="/login">
          <SideIconContainer icon={iosHeartOutline}/>
      </Link>
    );
  }
  if (props.liked) {
    return (
      <a href='javascript:void(0);' onClick={props.onUnlike}>
         <SideIconContainer icon={iosHeart}/>
      </a>
    );
  }
  return (
    <a href='javascript:void(0);' onClick={props.onLike}>
        <SideIconContainer icon={iosHeartOutline}/>
    </a>
  );
}

function ClassifiedIcon(props) {
  if (!props.isAuth) {
    return (
      <Link to="/login">
        <SideIconContainer icon={iosPlusOutline}/>
      </Link>
    );
  }
  if (props.classified) {
    return <a href='javascript:void(0);'><SideIconContainer icon={iosCheckmarkOutline}/></a> ;
  }
  return (
    <a href='javascript:void(0);' onClick={props.onClassify}>
       <SideIconContainer icon={iosPlusOutline}/>
    </a>
  );
}

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.state = {
      isLoading: false,
      img: '',
      images: [],
      classifies: [],
      nextURL: '',
      calculations: {
        bottomVisible: false,
      },
      modal: {
        open: false,
        imageIndex: null,
        classifies: [],
        classifyId: null,
        searchableClassfies: []
      },
      category: null
    };
    this.handleLikeImage = this.handleLikeImage.bind(this);
    this.handleClassifyImage = this.handleClassifyImage.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSelectedClassify = this.handleSelectedClassify.bind(this);
    this.submitClassify = this.submitClassify.bind(this);
  }

  handleFile(e) {
    const link = e.target.files[0];
    let form = new FormData()
    form.append('link', link)
    form.append('category', this.props.match.params.categoryId)
    console.log('submit image')
    agent.req.post(agent.API_ROOT + '/api/image/', form).set('authorization', `JWT ${this.props.token}`).then((response) => {

      agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
        let resBody = response.body;
        this.setState({images: resBody.results, nextURL: resBody.next})
      }).catch((e) => {
      })

    }).catch((e) => {
    })
  }

  handleChange = (image, e, value) => {
    let classify = value;
    console.log(image, classify);
    agent.req.post(agent.API_ROOT + '/api/image-profile/', {image, classify})
      .set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
      let resBody = response.body;
    }).catch((e) => {
    })
  }


  componentDidMount() {
    this.setState({isLoading: true})

    // agent.req.get(agent.API_ROOT + '/api/classify/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
    //   let resBody = response.body;
    //   let temp = [];
    //   for (let i = 0; i < resBody.results.length; i++) {
    //     temp.push({"text": resBody.results[i].name, "value": resBody.results[i].id})
    //   }
    //   this.setState({classifies: temp})
    // }).catch((e) => {
    // });
    agent.req.get(agent.API_ROOT + '/api/category/' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      this.setState({category: response.body})
      console.log(response.body);
    }).catch((e) => {
    })

    agent.req.get(agent.API_ROOT + '/api/image/?category=' + this.props.match.params.categoryId).set('authorization', `JWT ${this.props.token}`).then((response) => {
      let resBody = response.body;
      this.setState({isLoading: false})
      this.setState({images: resBody.results, nextURL: resBody.next})
    }).catch((e) => {
    })
  }

  handleUpdate = (e, {calculations}) => {
    let self = this;
    console.log(calculations)
    console.log(calculations.percentagePassed)
    this.setState({calculations})
    if (calculations.direction === "down" & calculations.percentagePassed > 0.3) {
      if (!!this.state.nextURL && this.state.isLoading == false) {
        this.setState({isLoading: true})
        agent.req.get(this.state.nextURL).set('authorization', `JWT ${this.props.token}`).then((response) => {
          let resBody = response.body;
          this.setState({isLoading: false})
          if (resBody.next != self.state.nextURL) {
            let newData = this.state.images.concat(resBody.results)
            this.setState({images: newData, nextURL: resBody.next})
          }
        }).catch((e) => {
        })
      }
    }
  }

  handleLikeImage(e, i) {
    if (!this.props.isAuth) {
      return;
    }

    e.preventDefault();
    const id = this.state.images[i].id;

    agent.req.post(agent.API_ROOT + '/api/image-profile/like/')
      .send({ image: id })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        const images = this.state.images.slice();
        images[i].liked = true;
        this.setState({images});
      })
      .catch((err) => {
      });
  }

  handleUnlikeImage(e, i) {
    if (!this.props.isAuth) {
      return;
    }

    e.preventDefault();
    const id = this.state.images[i].id;

    agent.req.del(agent.API_ROOT + '/api/image-profile/unlike/')
      .send({ image: id })
      .set('authorization', `JWT ${this.props.token}`)
      .set('accept', 'application/json')
      .then((resp) => {
        const images = this.state.images.slice();
        images[i].liked = false;
        this.setState({images});
      })
      .catch((err) => {
      });
  }

  closeModal() {
    const modal = {...this.state.modal};
    modal.open = false;
    modal.imageIndex = null;
    modal.classifyId = null;
    modal.classifies = [];
    this.setState({modal});
  }

  submitClassify() {
    if (!this.state.modal.classifyId) {
      this.closeModal();
      return;
    }

    const imageIndex = this.state.modal.imageIndex;
    const imageId = this.state.images[imageIndex].id;
    const classifyId = this.state.modal.classifyId;
    agent.req.post(agent.API_ROOT + '/api/image-profile/', {image: imageId, classify: classifyId})
      .set('authorization', `JWT ${this.props.token}`).type('form').then((response) => {
        const images = this.state.images.slice();
        images[imageIndex].classified = true;
        this.setState({images});

        this.closeModal();
    }).catch((e) => {
    })
  }

  handleSelectedClassify(classifyId) {
    const modal = {...this.state.modal};
    modal.searchableClassfies.forEach(function(c) {
      if (c.value === classifyId) {
        if (c.active) {
          c.active = false;
          c.content = <List.Content>{c.text}</List.Content>;
          modal.classifyId = null;
        } else {
          c.active = true;
          c.content = (
            <List.Content>
              <List.Content floated='right'>
                <Icon name='checkmark' />
              </List.Content>
              <List.Content>
                {c.text}
              </List.Content>
            </List.Content>
          );
          modal.classifyId = classifyId;
        }
      } else {
        c.active = false;
        c.content = <List.Content>{c.text}</List.Content>;
      }
    });
    this.setState({modal});
  }

  handleClassifyImage(e, i) {
    e.preventDefault();

    const searchableClassfies = [];
    agent.req.get(agent.API_ROOT + `/api/classify/?category=${this.state.images[i].category.id}&limit=50`).set('authorization', `JWT ${this.props.token}`).then((response) => {
      const resBody = response.body;
      for (let i = 0; i < resBody.results.length; i++) {
        searchableClassfies.push({
          content: <List.Content>{resBody.results[i].name}</List.Content>,
          text: resBody.results[i].name,
          value: resBody.results[i].id,
          active: false
        });
      }

      const modal = {...this.state.modal};
      modal.open = true;
      modal.imageIndex = i;
      modal.classifies = searchableClassfies;
      modal.searchableClassfies = searchableClassfies;
      this.setState({modal});
    }).catch((e) => {
    });
  }

  handleModalSearch(text) {
    const modal = {...this.state.modal};
    if (!text) {
      modal.searchableClassfies = modal.classifies;
      this.setState({modal});
      return;
    }

    const re = new RegExp(text, 'i');
    const isMatch = result => re.test(result.text);
    modal.searchableClassfies = filter(modal.classifies, isMatch);
    this.setState({modal});
  }

  renderLikedIcon(i) {
    return (
      <LikedIcon
        isAuth={this.props.isAuth}
        liked={this.state.images[i].liked}
        onLike={e => this.handleLikeImage(e, i)}
        onUnlike={e => this.handleUnlikeImage(e, i)}
      />
    );
  }

  renderClassifiedIcon(i) {
    return (
      <ClassifiedIcon
        isAuth={this.props.isAuth}
        classified={this.state.images[i].classified}
        onClassify={e => this.handleClassifyImage(e, i)}
      />
    );
  }

  render() {
    let self = this;
    return (
      <Visibility once={true} onUpdate={this.handleUpdate}>
        <Segment>

        <Header as='h2' icon>
            {/*<Image src={"https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl="+(this.state.category ? this.state.category.contract_address : '')+"&choe=UTF-8"}/>*/}
            {this.state.category ? this.state.category.name :''}
            <Header.Subheader>
              </Header.Subheader>
            <div className='ui three'>
                <Button basic color='grey' content={this.state.category && this.state.category.total_followers ? `Followers ${this.state.category.total_followers}` : 'Followers 0'} ></Button>
                <Button basic color='grey' content={this.state.category && this.state.category.total_images ? `Images ${this.state.category.total_images}` : 'Images 0'} ></Button>
                <Button basic color='green' content='Buy' ></Button>
            </div>
        </Header>

        </Segment>
        <Segment vertical>

            {/* <div className="row">
              <Form>
                <Form.Field>
                  <label>Upload image to this category</label>
                  <input type='file' onChange={this.handleFile} placeholder='First Name'/>
                </Form.Field>
              </Form>
            </div> */}
           <Container>
            <Card.Group centered>
                  {this.state.images.map((item, i) => {
                    return (
                      <Card key={i}>
                        <Link className="ui image" to={"/cat/" + item.category.id}>
                          <Image src={item.link}/>
                         </Link>
                        <Card.Content>
                          <div style={{float: 'left'}}>
                            <div style={{display: 'inline', marginRight: '2em'}}>
                              {this.renderLikedIcon(i)}
                            </div>
                            <div style={{display: 'inline'}}>
                              {this.renderClassifiedIcon(i)}
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    )
                  })}

                </Card.Group>
                </Container>
              <Modal size='large'closeOnEscape closeIcon open={this.state.modal.open} onClose={this.closeModal} style={{height: '90%'}}>
                <Modal.Header>Choose classify</Modal.Header>
                <Modal.Content style={{height: '80%', overflowY: 'scroll'}}>
                  {/*<Input fluid onChange={(e, data) => this.handleModalSearch(data.value)} icon='search' placeholder='Search classify...' />*/}
                  <List divided selection items={this.state.modal.searchableClassfies} onItemClick={(e, data) => this.handleSelectedClassify(data.value)} />
                </Modal.Content>
                <Modal.Actions>
                  <Button fluid positive content='Done' onClick={this.submitClassify} style={{marginLeft: 0}} />
                </Modal.Actions>
              </Modal>
        </Segment>
        <Segment vertical loading={this.state.isLoading}/>
      </Visibility>

    )
  }
}

export default props => (<AuthConsumer>
    {({token, isLoading, isAuth}) => {
      return <Login {...props} token={token} isAuth={isAuth} isLoading={isLoading}/>
    }}
  </AuthConsumer>
)
