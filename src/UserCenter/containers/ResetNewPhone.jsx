import React, {Component} from 'react';
import NavigationBar from '../../Common/NavigationBar/NavigationBar.jsx';
import WeUI from 'react-weui';

const {
    ButtonArea,
    Button,
    CellsTitle,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Label,
    Input,
    Toptips
} = WeUI;
export default class ResetNewPhone extends Component {
    constructor(props) {
        super(props);
        this.LeftClick = this.LeftClick.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.NextClick = this.NextClick.bind(this);
        this.state = ({
            count: 61,
            clearTime: 0,
            showWarn: false,
            warnTimer: null,
            tipText: "",
            canClick: true,
        });
        this.state.warnTimer && clearTimeout(this.state.warnTimer);
    }

    componentWillMount() {
    }

    showWarn(text) {
        this.setState({showWarn: true, tipText: text});

        this.state.warnTimer = setTimeout(() => {
            this.setState({showWarn: false});
        }, 2000);
    }

    LeftClick() {
        HistoryManager.pageBack();
    }

    checkCode(phoneNum, code) {
        let fromData = new FormData();
        fromData.append("mobilecode", code);
        fromData.append("mobile", phoneNum);
        fetch(getHost() + "rest/buyer/updateMemberMobile", {
            method: 'POST',
            credentials: 'include',
            body: fromData
        }).then(response => response.json()).then(json => {
            if (json.result===1) {
                // markDataRequestFlag();
                HistoryManager.pageBackTwice();
                return true;
            } else {
                this.showWarn(json.message);
                return;
            }
        }).catch(e => {
            this.showWarn("网络出现了点问题");
            console.log("网络出现了点问题：" + e);
        });

    }

    NextClick() {
        let phoneNum = document.getElementById("phoneNum").value;
        let code = document.getElementById("testCode").value;
        if (!(/^1(3|4|5|7|8)\d{9}$/.test(phoneNum))) { //手机号验证
            this.showWarn("手机号码有误");
        } else if (!code) {
            this.showWarn("请输入验证码");
        } else {
            this.checkCode(phoneNum, code);
        }
    }

    startTimers() {
        if (this.state.count < 1) {
            //关闭定时器,开启按钮
            clearTimeout(this.state.clearTime);
            this.setState({canClick: true});
            document.getElementById("getCode").innerHTML = "获取验证码";
            this.setState({
                count: 61
            })
        } else {
            //禁止按钮点击

            let time = this.state.count;
            time -= 1;
            this.setState({
                count: time
            });
            this.setState({canClick: false});
            document.getElementById("getCode").innerHTML = "(" + time + "s)重新获取";
            let temp = setTimeout(
                () => {
                    this.startTimers()
                },
                1000
            );
            this.setState({
                clearTime: temp
            })
        }
    }

    handleClick() { //验证码计时
        if (this.state.canClick) {
            let phoneNum = document.getElementById("phoneNum").value;
            let self = this;
            if (!(/^1(3|4|5|7|8)\d{9}$/.test(phoneNum))) {
                this.showWarn("手机号码有误");
                return false;
            }
            //先检测
            let fromData = new FormData();
            fromData.append("mobile", phoneNum);
            fetch(getHost() + "/rest/common/exisMobile", {
                method: 'POST',
                credentials: 'include',
                body: fromData
            }).then(response => response.json()).then(json => {
                if (json.result === 1) {
                    //注册账号获取验证码
                    // alert("注册获取验证码");
                    self.startTimers();
                    let fromData = new FormData();
                    fromData.append("mobile", phoneNum);
                    fromData.append("type", "register");
                    fetch(getHost() + "/rest/front/mobile/genMobileCode", {
                        method: 'POST',
                        credentials: 'include',
                        body: fromData
                    }).then(response => response.json()).then(json => {
                        if (json.result === 1) {
                            self.startTimers()
                        } else {
                            self.showWarn(json.message);
                        }
                    })
                } else {
                    self.showWarn(json.message);
                }
            })
        }
    }


    render() {
        return (
            <div>
                <NavigationBar Title="修改验证手机" LeftBar="true" LeftTitle="返回"
                               LeftIconSrc="/assets/images/common/nav_back_icon.png" LeftClick={this.LeftClick}/>
                <Cells>
                    <Cell>
                        <CellHeader>
                            <Label>新手机号</Label>
                        </CellHeader>
                        <CellBody>
                            <Input type="tel" id="phoneNum" placeholder="请输入新的手机号"/>
                        </CellBody>
                        <CellFooter>
                            <Button type="vcode"
                                    style={{height: "24px", lineHeight: "24px", color: "#0088EC", fontSize: "1.2rem"}}
                                    id="getCode" onClick={this.handleClick}>获取验证码</Button>
                        </CellFooter>
                    </Cell>
                    <Cell>
                        <CellHeader>
                            <Label>验证码</Label>
                        </CellHeader>
                        <CellBody>
                            <Input type="number" id="testCode" placeholder="请输入验证码"/>
                        </CellBody>
                    </Cell>
                </Cells>
                <ButtonArea>
                    <Button type="warn" onClick={this.NextClick}>提交</Button>
                </ButtonArea>
                <Toptips type="warn" show={this.state.showWarn}>{this.state.tipText}</Toptips>
            </div>
        )
    }


}