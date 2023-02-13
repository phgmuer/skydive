import React, {useState, useRef} from 'react'
import { Breadcrumb, Layout, Menu, theme, Tabs, Space, Card, DatePicker, Input, Button, Row,Col, Typography, Alert } from 'antd';

import { EyeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import axios from 'axios';

import * as Settings from '../../settings'

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;

export default function AddJump({setShouldFetchJumps}) {
  const [jumpDate, setJumpDate] = useState("");
  const [jumpDescription, setJumpDescription] = useState("");
  const [alerts, setAlerts] = useState([]);

  const addJump = () => {
        // Backend Anfrage zum Hinzufügen des neuen Sprungs.
    axios.put(Settings.Server + 'jumps/add', {
          "jumpDate": jumpDate,
          "jumpDescription": jumpDescription},
          {params: {
          "sessionToken": localStorage.getItem("session_token"),
          "sessionId": localStorage.getItem("session_id")}}).then(result => {
        if (result?.data?.success) {
           setAlerts([{message: "Done.", type: "success"}]);
           setJumpDescription("");
           setShouldFetchJumps(true);
        } else {
           console.warn(result);
           const errorMessage = result?.data?.message || "";
           setAlerts([{message: `Fehler: ${errorMessage}`, type: "error"}]);
        }
      }, err => {
        setAlerts([{message: "Fehler.", type: "error"}]);
        console.error("PUT error", err);
      });
  };

  return (
  <>
  <div style={{height: "1px"}}></div>
  <Typography.Title level={2}>Sprung eintragen</Typography.Title>
  <div style={{height: "20px"}}></div>

    <Row>
    <Col ><DatePicker placeholder="Sprungdatum"  onChange={(_, dateString) => setJumpDate(dateString)} /></Col>
    <Col ><div style={{width: "5px"}}></div></Col>
    <Col><TextArea value={jumpDescription} placeholder="Sprungbeschreibung" autoSize onChange={(e) => setJumpDescription(e.target.value)}/></Col>
        <Col ><div style={{width: "5px"}}></div></Col>

    <Col >
      <Button type="primary" onClick={addJump}>Speichern</Button>
      </Col>
      <Col ><div style={{width: "5px"}}></div></Col>
      { alerts.map(alert => <div key={alert}><Alert message={alert.message} type={alert.type} /></div>) }
            </Row>
    </>


   );
};
