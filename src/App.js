import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Input,Select,DatePicker,Form,Layout,Col,Row,Button,Upload,List,message} from 'antd'
import {BrowserRouter} from 'react-router'
import 'antd/dist/antd.min.css'
import {Map, Marker, MarkerList ,NavigationControl, InfoWindow,Road,Polyline} from 'react-bmap'
import axios from 'axios'
const {Option} = Select;

const baseURL = "http://localhost:7001/"

const api = axios.create({
    baseURL
})

const {Item} = Form;
const {Header,Content,Footer,Sider} = Layout;

let time = []

for (let i =0;i<24;i++)
{
    time[i]=i
}



const simpleMapStyle = {
    styleJson: [
        {
            "featureType": "all",
            "elementType": "all",
            "stylers": {
                "lightness": 41,
                "saturation": -70
            }
        }
    ]
}

class InputForm extends React.Component
{

    defaultProps = {
        onUpdated : (data)=>{}
    }

    state ={
        loading:false
    }

    onUploadChange=()=>{

    }
    onSubmit=(e)=>{
        e.preventDefault()
        const {form} = this.props

        form.validateFields(null,{},(err,values)=>{
            if(!err)
            {
                if(values.startTime>=values.startTime)
                {
                    message.error('start time must be later than start time.',2);
                    return ;
                }
                this.setState({loading:true})
                api.post('query',{
                    start:values.startTime,
                    end:values.endTime,
                    hash:values.upload.file.response.hash
                }).then((result)=>{
                    this.setState({loading:false})
                    this.props.onUpdated(result.data)
                });
            }
            else
            {
                if(err.upload)
                {
                    message.error(err.upload.errors[0].message)
                }
            }
        })
    }
    render()
    {

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const {form} = this.props
        return <div className={"input-container"}>
            <Form layout={"horizontal"} onSubmit={this.onSubmit}>
                <Row>
                    <Col span={8}>
                <Item label={"Start Time :"} {...formItemLayout}>
                    {
                        form.getFieldDecorator('startTime',{
                            rules:[{required:true,message:'you must choose a start time'}]})(
                                <Select>
                                    {
                                        time.map((value,key)=><Option value={value} key={value}>{value}时</Option>)
                                    }
                                </Select>
                        )
                    }
                </Item>
                    </Col>
                    <Col span={8}>
                <Item label={"End Time:"} {...formItemLayout}>
                    {
                        form.getFieldDecorator('endTime',{
                            rules:[{required:true,message:'you must choose a end time'}]})(
                            <Select>
                                {
                                    time.map((value,key)=><Option value={value} key={value}>{value}时</Option>)
                                }
                            </Select>
                        )
                    }
                </Item>
                    </Col>
                    <Col span={8}>
                        <Row>
                            <Col span={12}>
                                {
                                    form.getFieldDecorator('upload',{rules:[{required:true,message:'You must upload a file.'}]})(
                                    <Upload accept={".csv"} action={`${baseURL}upload`}>
                                        <Button>Upload Data File</Button>
                                    </Upload>)
                                }
                            </Col>
                            <Col span={12}>
                        <Button type={"primary"} htmlType={"submit"} loading={this.state.loading}>
                            Confirm
                        </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </div>
    }
}

const WrappedInputForm = Form.create({
})(InputForm)

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            marks : [

            ]
        }
    }

    formatedMarks=()=>this.state.marks.map(({lng,lat,title},index)=>({location:`${lng},${lat}`,text:title}))
    center=()=>{
        let pos = this.state.marks.reduce((left,right)=>({lng:left.lng+right.lng,lat:left.lat+right.lat}),{lng:0.0,lat:0.0})
        pos ={
            lng: pos.lng / this.state.marks.length,
            lat: pos.lat / this.state.marks.length
        }
        return pos
    }

  render() {
      const formatedMarks = this.formatedMarks();

    return (
      <div className="App">
          <Header style={{backgroundColor:'white',marginTop:'2%'}}>
              <WrappedInputForm onUpdated={(data)=>{this.setState({marks:data})}}/>
          </Header>
          <Content>
              <Layout style={{marginLeft:'4%',marginRight:'4%',backgroundColor:'white'}}>
              <Sider style={{backgroundColor:'#efefef',overflowY:'scroll',height:800}} width={500}>
                  <List
                      dataSource={this.state.marks}
                      renderItem={(item,key) => (
                          <List.Item>
                              <List.Item.Meta
                                  title={`Position: ${item.title}`}
                                  description={`Location1: ${item.lng} ${item.lat}`}
                              />
                          </List.Item>
                      )}
                  />
              </Sider>
              <Content>
              <Map style={{height:800,marginLeft:'2%',backgroundColor:'white'}} center={this.center()} zoom="13">
                  <Polyline
                      strokeColor='green'
                      path={this.state.marks}
                  />
                  <MarkerList data={formatedMarks}
                              fillStyle="#ff3333"

                              animation={true}
                              isShowShadow={false}
                              multiple={true}
                              autoViewport={false}
                  />
              </Map>
              </Content>
              </Layout>
          </Content>
          <Footer style={{backgroundColor:'white'}}>
          </Footer>
      </div>
    );
  }
}

export default App;
