// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './components/App';
// import store from './store';

// @ts-ignore
// const Root = ({ store }) => (
//     <Provider store={store}>
//         <Router>
//             <Route path="/:filter?" component={App} />
//         </Router>
//     </Provider>
// );

const Root = () => (
    <Router>
        <Route path="/" component={App} />
    </Router>
);

// require('../../misc/index');

render(
    //<Root store={store} />,
    <Root/>,
    document.getElementById('main')
    // document.body
);
