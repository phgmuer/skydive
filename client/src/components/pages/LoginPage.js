

import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router';
import { Button, Space, Col, Divider, Row, Layout, Alert, Input } from 'antd';
import axios from 'axios';

import * as Settings from '../../settings'

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginStatus, setLoginStatus] = useState("");

    const tryLogin = async () => {
      setLoginStatus("inprogress");

      console.log(`Try login ${username} || ${password} `);
      try {
        const result = await axios.get(Settings.Server + 'auth/login', {params: {'username': username, 'password': password}});
        console.log(`Login attempt: ${result}`);
        if (result.status == 200 && result.data && result.data.success && result.data.sessionToken && result.data.sessionId && result.data.loginUsername) {
          localStorage.setItem("session_token", result.data.sessionToken);
          localStorage.setItem("session_id", result.data.sessionId);
          console.log("tryLogin(): Succeeded.");
          setLoginStatus("success");
        } else {
          setLoginStatus("failed");
          console.log("tryLogin(): Failed.");
        }
        console.log(result);
      } catch (e) {
        setLoginStatus("failed");
        console.error(`Login error ${e}.`);
      }
    };



    if (loginStatus === "success") {
      return <Redirect to="/home" />;
    }

    const statusBar = (() => {
      if (loginStatus === "failed") {
        return <Row><Col span={20} offset={2}><Alert message={`Login fehlgeschlagen.`} type="error" /></Col></Row>
      } else {
        return < ></>
      }
    })();
      return (
         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: "500px"}}>
         <Space direction="vertical">
            <Row align="middle"  justify="space-around" >
               <Col  span={20}>
                 <Alert message="Fallschirm Logbuch" description="Das personalisierte Fallschirmsprung Logbuch. Bitte mit Benutzernamen und Passwort einloggen oder einen neuen Account erstellen." type="info"/>
               </Col>
            </Row>
             <Row align="middle"  justify="space-around" ><Col span={20}><Input onChange={e => setUsername(e.target.value)} placeholder="username" /></Col></Row>
             <Row align="middle"  justify="space-around" ><Col span={20}><Input.Password onChange={e => setPassword(e.target.value)} placeholder="password" /></Col></Row>
             <Row align="middle"  justify="space-around" ><Col>
               <Button type="primary" onClick={tryLogin}>Login</Button></Col>
               <Col><Link to="/register"> <Button type="default">Registrieren</Button></Link></Col></Row>
               {statusBar}
           </Space>
         </div>
      );
    }

