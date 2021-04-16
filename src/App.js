import './App.css';
import * as React from "react";
import { Admin, Resource } from 'react-admin';
import ListAltRoundedIcon from '@material-ui/icons/ListAltRounded';
import {LineDataTable} from './dataTable/LineDataTable'
import dataProvider from './dataProvider/dataprovider'
// import simpleRestProvider from 'ra-data-simple-rest';

function App() {
  return (
      <Admin
          title="система"
          // dataProvider={simpleRestProvider('http://127.0.0.1:3005/api')}
          dataProvider={dataProvider}
          // layout={Layout}
      >
          <Resource
              name="lines"
              list={LineDataTable}
              options={{ label: 'Список ', icon: <ListAltRoundedIcon />}}
          />

      </Admin>
  );
}

export default App;
