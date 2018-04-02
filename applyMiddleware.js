import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) { //
    return createStore => (...args) => { // 返回一个 enhancer 函数，接受 createStore 作为参数，再返回一个函数，接受 reducer 和 preloadedState 作为参数
        const store = createStore(...args)
        let dispatch = () => {
            throw new Error(
                `Dispatching while constructing your middleware is not allowed. ` +
                `Other middleware would not be applied to this dispatch.`
            )
        }
        let chain = []

        const middlewareAPI = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args)
        }
        chain = middlewares.map(middleware => middleware(middlewareAPI)) // middlewareAPI 暴露给中间件，返回一个函数
        dispatch = compose(...chain)(store.dispatch) // 从右往左组合每一个中间件返回的函数，以 store.dispatch 作为参数，从最后一个中间件返回的函数开始执行，返回一个新的 dispatch 函数，这里的 dispatch 并不是 store 原有的，而是经过组合中间件之后新的 dispatch

        return {
            ...store,
            dispatch
        }
    }
}