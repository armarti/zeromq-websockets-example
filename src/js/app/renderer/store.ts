import {createStore, applyMiddleware, StoreEnhancer, Middleware} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { rootReducer } from './reducers';

// @ts-ignore
const middleware: Middleware = {};

let storeEnhancers: StoreEnhancer;
if(process.env.NODE_ENV !== 'production') {
    storeEnhancers = composeWithDevTools({
        // Specify name here options:
        // https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
    })(applyMiddleware(middleware));
} else {
    storeEnhancers = applyMiddleware(middleware);
}

// @ts-ignore
const store = createStore(rootReducer, /*preloadedState,*/ storeEnhancers);
export default store;
