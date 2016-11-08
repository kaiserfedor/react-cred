/**
 * Created by Kaiser on 05.10.2016.
 */
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import rootReducer from './rootReducer';

export default function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk)
    );
    if (module.hot) {
        module.hot.accept('./rootReducer', () => {
            const nextRootReducer = require('./rootReducer');
            store.replaceReducer(nextRootReducer);
        });
    }
    return store;
}
