import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Input,Select,DatePicker,Form,Layout,Col,Row,Button,Upload,List} from 'antd'
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
                <Item label={"起始时间"} {...formItemLayout}>
                    {
                        form.getFieldDecorator('startTime',{
                            rules:[{required:true,message:'必须选择时间'}]})(
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
                <Item label={"终止时间"} {...formItemLayout}>
                    {
                        form.getFieldDecorator('endTime',{
                            rules:[{required:true,message:'必须选择时间'}]})(
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
                                    form.getFieldDecorator('upload',{rules:[{required:true,message:'必须上传文件'}]})(
                                    <Upload accept={".csv"} action={`${baseURL}upload`}>
                                        <Button>上传文件</Button>
                                    </Upload>)
                                }
                            </Col>
                            <Col span={12}>
                        <Button type={"primary"} htmlType={"submit"} loading={this.state.loading}>
                            确认
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
                { lng: -73.963241577148438, lat : 40.775009155273438 },
                { lng: -73.990303039550781, lat : 40.714309692382813},
                { lng: -73.995513916015625, lat: 40.764793395996094},
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
