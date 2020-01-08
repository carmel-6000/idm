import React from 'react';
// import './_Login.scss';
import { Redirect } from 'react-router';
import { Dialog, DialogTitle, Button, DialogContent, DialogActions } from '@material-ui/core';
import Login from '../../../auth/Login';
import eduImg from '../imgs/edu.png';

const IDM_URL = 'https://is.remote.education.gov.il/nidp/oauth/nam/authz?client_id=2d938a37-0fe3-46c8-a619-e4cb8284ab4d&scope=openid%20profile%20eduorg%20edustudent&response_type=code&reut_data=hihi&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fidmcallback';


class LoginIdm extends Login {

    constructor(props) {
        super(props);
        let loc = window.location.origin + (window.location.hash[0] === "#" ? `/#${this.props.redirectUrl || '/samples'}` : `${this.props.redirectUrl || '/samples'}`);
        this.origin = this.serialize({ state: loc });
    }
    serialize = (obj, prefix) => {
        var str = [];

        var p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + '[' + p + ']' : p;

                var v = obj[p];
                str.push((v !== null && typeof v === 'object')
                    ? this.serialize(v, k)
                    : encodeURIComponent(k) + '=' + encodeURIComponent(v));
            }
        }
        return str.join('&');
    };

    handleIDMLogin = () => {

        window.location.href = IDM_URL + "&" + this.origin;
    }

    render() {
        if (this.state.redirTo != false) {
            return (<Redirect to={{ pathname: '/', state: this.state }} />);

        } else
            return (
                <div className='loginPage'>

                    <div className='loginBox'>
                        <div className='frow'>
                        </div>
                        <p className="mt-1">ברוכים הבאים !</p>
                        {/*This div is for smooth behavior of forgot-pass. */}
                        <div className="collapses show" id="group-div">
                            <form onSubmit={this.handleLogin} id="logForm" className="form">
                                <div className='form-group'>
                                    <input className="form-control" type='email' ref='email' placeholder='מייל' defaultValue="admin@carmel6000.amitnet.org" required />
                                </div>
                                <div className='form-group'>
                                    <input className="form-control" type='password' ref='pw' placeholder='סיסמא' defaultValue="E2PSzAmJ-5-ldKnl" required />

                                </div>
                                <div className='form-group'>
                                    {this.state.isLoading ?
                                        <button className='btn btn-warning'>מתחבר...</button> :
                                        <button onClick={this.handleLogin} type='button' className='btn btn-warning login_input'  >היכנס</button>
                                    }
                                </div>

                            </form>
                            <button onClick={this.handleIDMLogin} type='button' id="idm" className='btn btn-warning login_input'>
                                התחברות דרך מערכת הזדהות אחידה
                                    <img height="40px" width="40px" src={eduImg} alt="ינשוף"></img>
                            </button>
                        </div>
                        {/*End of smooth div */}

                        {/* Reset section */}
                        <div id="resetPassDiv" className="collapse collapses">
                            <form onSubmit={this.reset}>
                                <input ref="resetEmailInput" id="reset" type="email" className="form-control login_input" placeholder="Email" required />
                                <button type="submit" className="btn btn-warning login_input mt-3" >
                                    אפס סיסמה
                        </button>
                            </form>
                        </div>

                        <p>
                            <button className="btn btn-link login_input" id="toggle" type="button" data-toggle="collapse" data-target=".collapses" aria-expanded="false" aria-controls="resetPassDiv group-div"
                                onClick={(event) => {
                                    event.target.innerHTML = event.target.innerHTML == "התחבר" ? 'שכחת סיסמה?' : "התחבר"
                                }}>
                                שכחת סיסמה?
                            </button>
                        </p>

                    </div>


                    <Dialog open={this.state.resetPassDialog} aria-labelledby="reset-modal">
                        <DialogTitle id="reset-modal" className="float-right" >
                            <p style={{ float: "right", margin: "0" }}>שינוי סיסמה</p>
                        </DialogTitle>

                        <DialogContent>
                            {this.state.resetPassMsg}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ resetPassDialog: false })} children="סבבה" color="primary" />
                        </DialogActions>
                    </Dialog>
                    {/* End of reset section */}
                </div>
            )
    }
}

export default LoginIdm;
