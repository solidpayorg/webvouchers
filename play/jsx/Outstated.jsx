
// Create context for global store assignment
const StateContext = React.createContext();

const Provider = ({stores, children}) => {
  // map that stores initialized versions of all user store hooks
  const storesMap = new Map();
  // complain if no instances provided for initialization
  if (!stores || !stores.length) {
    throw new Error('You must provide stores list to a <Provider> for initialization!');
  }
  // initialize store hooks
  // this is required because react expects the same number
  // of hooks to be called on each render
  // so if we run init in useStore hook - it'll break on re-render
  stores.forEach(store => {
    storesMap.set(store, store());
  });
  // return provider with stores map
  return <StateContext.Provider value={storesMap}>{children}</StateContext.Provider>;
};

function useStore(storeInit) {
  const map = React.useContext(StateContext);

  // complain if no map is given
  if (!map) {
    throw new Error('You must wrap your components with a <Provider>!');
  }

  const instance = map.get(storeInit);

  // complain if instance wasn't initialized
  if (!instance) {
    throw new Error('Provided store instance did not initialized correctly!');
  }

  return instance;
}

const store = () => {
  const [count, setCount] = React.useState(0);

  const increment = (amount) => setCount(count + amount);
  const decrement = () => setCount(count + 30);
  const reset = () => setCount(0);

  return {count, increment, decrement, reset};
};

function Counter() {
  const {count, increment, decrement, reset} = useStore(store);

  return (
    <div>
      <span className="button is-large">Total : {count}</span>
      <hr/>
      <button className="button is-link is-large" onClick={() => {increment(5)}}>+5</button>&nbsp;
      <button className="button is-link is-large" onClick={() => {increment(30)}}>+30</button>
      <hr/>
      <button className="button is-link is-large" onClick={reset}>Reset</button>
      <hr/>
    </div>
  );
}

ReactDOM.render(
  
  <Provider stores={[store]}>
  <NavbarSolidLogin
    className='is-link'
    title='Outstated App'
    sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/outstated.html/' />
    <div class="section">
      <Counter />
    </div>
  </Provider>,
  document.getElementById('root')
);