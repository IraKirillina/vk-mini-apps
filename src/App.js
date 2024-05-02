import React, { useState, useEffect } from 'react';
import { AdaptivityProvider, ConfigProvider, AppRoot, SplitLayout, SplitCol, View, Panel, PanelHeader } from '@vkontakte/vkui';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewsList from './components/NewsList';
import NewsDetails from './components/NewsDetails';

export default function App() {
  const [initialPath, setInitialPath] = useState('/');

  useEffect(() => {
    setInitialPath(window.location.pathname);
  }, []);

  return (
    <Router>
      <AppRoot>
        <View activePanel="main">
          <Panel id="main">
            <Routes>
              <Route path="/" element={<NewsList />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              {/* <Route path="*" element={<NewsList />} /> */}
            </Routes>
          </Panel>
        </View>
      </AppRoot>
    </Router>
  );
}