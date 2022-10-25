import React, {useState} from 'react';
import {CreateOrder, Table} from './components/Table'

function App() {
  return (
    <div className="App">
      <div>
        {CreateOrder()}
      {Table(
          {
              columns: [
                  {accessor: "reward"}
              ],
              data: [{
                  reward: "10"
              }],
              fetchData: ()=>{},
              loading: "",
              pageCount: "any"})}
      </div>
    </div>
  );
}

export default App;
