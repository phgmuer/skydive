import React, {useState} from 'react'
import { Breadcrumb, Layout, Menu, theme, Tabs, Space, Timeline, Row,Col, Typography } from 'antd';

import { EyeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import axios from 'axios';

// Die Antd `Timeline` Komponente ist nicht nach Links orientiertbar. Ich verwende den Workaround in `Timeline.css`
// von hier: https://github.com/ant-design/ant-design/issues/26485#issuecomment-858047855
import './Timeline.css'
import * as Settings from '../../settings'

export default function ListJumps({shouldFetchJumps, setShouldFetchJumps}) {
  const [jumps, setJumps] = useState([]);

  React.useEffect(() => {
    if (shouldFetchJumps) {
      setShouldFetchJumps(false);

      console.log("Fetch jumps.");

      // Abfrage der Sprünge vom Backend.
      axios.get(Settings.Server + 'jumps/list', {
        params: {
          "sessionToken": localStorage.getItem("session_token"),
          "sessionId": localStorage.getItem("session_id")}}).then(result => {
        if (result?.data?.success) {
          setJumps(result.data.jumps);
        } else {
           console.warn("Fetch jumps not successful.")
           console.warn(result);
        }
      }, err => {
        console.error("GET error", err);
      });
    }
  }, [shouldFetchJumps]);


  return (
  <>
  <div style={{height: "1px"}}></div>
  <Typography.Title level={2}>Meine Fallschirmsprünge</Typography.Title>
  <div style={{height: "20px"}}></div>
  <Typography.Title level={4}>Anzhal Sprünge: {jumps.length}</Typography.Title>
  <div className="timeline_container">
  <Timeline
        mode="left"
        items={jumps.map(jump => {
          return {
            label: jump.date,
            children: jump.description
          };
        })}
      />
   </div>
   </>);
};