import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { Button, Space, Col, Divider, Row, Layout, Alert, Input } from 'antd';
import axios from 'axios';
import * as Settings from '../../settings'


export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [registerStatus, setRegisterStatus] = useState({status: "", message:""});


    const createUser = async () => {
      try {
        const result = await axios.put(Settings.Server + 'auth/register', {'username': username, 'password': password, 'email': email});
        if (result.status == 200 && result?.data?.success) {
          console.log("created User.");
          setRegisterStatus({status: "success", message:""});

        } else {
          console.warn("createUser failed");
          console.warn(result);
          setRegisterStatus({status: "failed", message:result?.data?.message || ""});
        }
      } catch (e) {
          console.error("createUser failed");
          setRegisterStatus({status: "failed", message:"Server Error."});
          console.error(e);
       }
    };


    const statusBar = (() => {
    if (registerStatus.status === "success") {
       return <Row><Col span={20} offset={2}>Success. You can now <Link to="/login"><Button type="primary">Login</Button></Link></Col></Row>
      //return <Row align="middle"  justify="space-around" ><Col>AAA</Col></Row>;
    } else if (registerStatus.status === "failed") {
      const message = registerStatus.message || "";
      return <Row><Col span={20} offset={2}><Alert message={`Failed. ${message}`} type="error" /></Col></Row>
    } else {
      return < ></>
    }
    })();

    // Verstecke den Registrations Button nach erfolgreichem Registrieren.
    const registerButton =  (() => {
       if (registerStatus.status !== "success") {
         return <Row><Col span={20} offset={10}><Button type="primary" onClick={createUser}>Register</Button></Col></Row>
       } else {
         return < ></>
       }
    })();

    return (
       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
       <Space direction="vertical">
          <Row align="middle"  justify="space-around" >
             <Col span={20}>
               <Alert message="Fallschirm Logbuch" description="Erstellen eines neuen Benutzers. Es wird keine Bestätigungsemail verschickt." type="info"/>
             </Col>
          </Row>
           <Row align="middle"  justify="space-around" ><Col span={20}><Input placeholder="username" onChange={e => setUsername(e.target.value)} /></Col></Row>
           <Row align="middle"  justify="space-around" ><Col span={20}><Input placeholder="email" onChange={e => setEmail(e.target.value)} /></Col></Row>
           <Row align="middle"  justify="space-around" ><Col span={20}><Input.Password placeholder="password" onChange={e => setPassword(e.target.value)} /></Col></Row>
             {statusBar}
             {registerButton}
           </Space>
    </div>
    )
}

