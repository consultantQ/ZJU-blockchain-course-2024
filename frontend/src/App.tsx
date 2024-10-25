import React from 'react';
import './App.css';
import BMRPage from "./pages/BMR";
import { Layout, Typography  } from 'antd';
const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  
    return (
      <Layout>
        <Header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
            <Title style={{marginTop: '5px'}}>房屋购买DEMO</Title>
        </Header>
        <Content style={{ padding: '0 48px', background: 'white' }}>
            <BMRPage/>
        </Content>
      </Layout>
    );
  };

export default App;
