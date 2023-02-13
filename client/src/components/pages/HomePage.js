import React, {useState} from 'react'
import { Breadcrumb, Layout, Menu, theme, Tabs, Space, Typography } from 'antd';

import { EyeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

import AddJump from '../jumps/AddJump'
import ListJumps from '../jumps/ListJumps'
import axios from 'axios';

import * as Settings from '../../settings'

const { Header, Content, Sider } = Layout;

export default function HomePage() {
   // Ich halte state für den Ladestatus der Sprünge ausserhalb der Sprung-Subkomponenten um die synchronisierung zwischen den Tabs
   // zu garantieren. Das heisst wenn ein neuer Sprung hinzugefügt wird will ich forcieren dass das nächste laden der ListJumps
   // neu fetched.
   const [loggedInUser, setLoggedInUser] = useState(null);
   const [shouldFetchJumps, setShouldFetchJumps] = useState(true);

   React.useEffect(() => {
     // Lade sprünge alle 30 sekunden neu auch ohne updates um synchronisation zwischen mehreren Geräten zu ermöglichen.
     setInterval(() => {
      setShouldFetchJumps(true);
    }, 1000 * Settings.RefreshIntervalSeconds);

     // Ich speichere das Session Token in dem Local Storage. Falls ein anderer user eingelogged wird ohne dass die seite
     // refreshed wurde müssen wir hier neu generieren.

     window.addEventListener("storage", () => {
      console.log("StorageEventListener");
      validateUser();
    });

    validateUser();
   }, []);

   // Überprüft die session Daten vom Local Storage mittels einer Anfrage ans Backend.
   const validateUser = () => {
    console.log("Validating User");
     axios.get(Settings.Server + 'auth/username', {
        params: {
          "sessionToken": localStorage.getItem("session_token"),
          "sessionId": localStorage.getItem("session_id")}}).then(result => {
        if (result?.data?.success) {
          setLoggedInUser(result.data.username);
        } else {
          console.warn(result);
          setLoggedInUser(null);
        }
      }, err => {
        console.error("GET error", err);
        setLoggedInUser(null);
      });
   };


  return (
    <Layout>
      <Header className="header">
        <Typography.Title level={4} style={{color: 'white' }}>{
          loggedInUser ? `Logbuch Benutzer ${loggedInUser}` : `Bitte einloggen`}</Typography.Title>
      </Header>
      <Layout>
          <div style={{height: "15px"}}></div>
        <Tabs
          tabPosition="left"
          items={[
                {key: "listJumps", icon: React.createElement(EyeOutlined), label: (<span><EyeOutlined />List Jumps</span>), children: <ListJumps shouldFetchJumps={shouldFetchJumps} setShouldFetchJumps={setShouldFetchJumps}/>},
                {key: "addJump", icon: React.createElement(PlusCircleOutlined), label: (<span><PlusCircleOutlined />Add Jump</span>), children: <AddJump setShouldFetchJumps={setShouldFetchJumps} />}]} />
        </Layout>
    </Layout>
  );
};


