import * as React from "react";
import { List, Datagrid, DateField, TextField,  } from 'react-admin';



export const LineDataTable = (props) => (
    <List {...props}
          perPage={25}
          sort={{field: 'gameid', order: 'desc' }}
    >
        <Datagrid>
            <TextField source="gameid" />
            <TextField source="league" />
            <DateField source="starttime" />
            <TextField source="t1" />
            <TextField source="t2" />
            <TextField source="w1" />
            <TextField source="tie" />
            <TextField source="w2" />
            <TextField source="w1tie" />
            <TextField source="w12" />
            <TextField source="w2tie" />
            <TextField source="lastchange" />
        </Datagrid>
    </List>
);