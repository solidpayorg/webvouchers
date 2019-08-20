// main
var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

if (!localStorage.getItem('startTime')) {
  localStorage.setItem('startTime', new Date().getTime())
}
if (!localStorage.getItem('startScore')) {
  localStorage.setItem('startScore', 0)
}
if (!localStorage.getItem('localTime')) {
  localStorage.setItem('localTime', new Date().getTime())
}
if (!localStorage.getItem('localScore')) {
  localStorage.setItem('localScore', 0)
}

var subject =
  new URLSearchParams(document.location.search).get('uri') ||
  'https://melvin.solid.live/credit/count.ttl'

// Create context for global store assignment
const StateContext = React.createContext()

const Provider = ({ stores, children }) => {
  // map that stores initialized versions of all user store hooks
  const storesMap = new Map()
  // complain if no instances provided for initialization
  if (!stores || !stores.length) {
    throw new Error(
      'You must provide stores list to a <Provider> for initialization!'
    )
  }
  // initialize store hooks
  // this is required because react expects the same number
  // of hooks to be called on each render
  // so if we run init in useStore hook - it'll break on re-render
  stores.forEach(store => {
    storesMap.set(store, store())
  })
  // return provider with stores map
  return (
    <StateContext.Provider value={storesMap}>{children}</StateContext.Provider>
  )
}

function useStore (storeInit) {
  const map = React.useContext(StateContext)

  // complain if no map is given
  if (!map) {
    throw new Error('You must wrap your components with a <Provider>!')
  }

  const instance = map.get(storeInit)

  // complain if instance wasn't initialized
  if (!instance) {
    throw new Error('Provided store instance did not initialized correctly!')
  }

  return instance
}

const store = () => {
  let initial = {}
  initial.count =
    new URLSearchParams(document.location.search).get('count') || 0

  const [template, setTemplate] = React.useState(initial)

  const increment = amount => setTemplate({ count: count + amount })

  const touch = (amount, day = 0) =>
    setTemplate({
      count: amount,
      day: day,
      now: new Date().getTime()
    })

  const decrement = () => setTemplate({ count: count + 30 })

  const getStore = () => {
    return template
  }

  const reset = (count, day = 0, push = false) => {
    count = count || 0

    let startTime = localStorage.getItem('startTime') || 0
    let startScore = localStorage.getItem('startScore') || 0
    let localTime = localStorage.getItem('localTime') || 0
    let localScore = localStorage.getItem('localScore') || 0
    let c = day % 360
    let s = day % 30
    let l = c - s
    let t = count
    let d = day
    let e = Math.floor((new Date().getTime() - startTime) / 1000)
    let a = (1000 - Math.round((e / (s + l - startScore)) * 100)) / 100

    // console.log('day % 360', day % 360, 'a', a)

    if (day % 360 === 355) {
      // console.log('###### resetting', count, day, push)

      if (push) {
        pushLast(a)
        console.log(localStorage.getItem('startTime'))
      }
      localStorage.setItem('startTime', new Date().getTime())
      localStorage.setItem('startScore', 0)
    }
    setTemplate({ count: count, day: day })

    // if (day % 5 === 0) {
    //   let e = Math.floor((new Date().getTime() - localTime) / 1000)
    //   let a = Math.round(e / 30)
    //   localStorage.setItem('localTime', new Date().getTime())
    //   localStorage.setItem('localScore', day % 30)
    //   cogoToast.info('Fast', {
    //     heading: (new Date().getTime() - parseInt(localTime)) / 1000
    //   })
    //   cogoToast.info('dates', {
    //     heading: new Date().getTime() - parseInt(localTime)
    //   })
    // }

    if (day % 30 === 0) {
      let e = new Date().getTime() - localTime
      let a = Math.round(e / 300) / 100
      localStorage.setItem('localTime', new Date().getTime())
      localStorage.setItem('localScore', day % 30)
      cogoToast.info('Pace', {
        heading: Math.round(1000 - a * 100) / 100,
        hideAfter: 60
      })
      // cogoToast.info('Elapsed', { heading: e })
    }
  }

  return { template, increment, decrement, touch, reset }
}

function pushLast (val) {
  if (!val) return
  console.log('###### pushing', val)

  let last = localStorage.getItem('last')
  if (!last) {
    localStorage.setItem('last', JSON.stringify([]))
  }
  let ret = JSON.parse(localStorage.getItem('last'))
  if (val !== ret[ret.length - 1]) {
    ret.push(val)
    localStorage.setItem('last', JSON.stringify(ret))
  }
}

function Points () {
  const { template, reset, touch } = useStore(store)

  function fetchCount (subject) {
    console.log('fetching', subject)

    UI.fetcher.load(subject, { force: true }).then(
      response => {
        let s = null
        let p = UI.store.sym('urn:query:hour')
        let o = null
        let w = UI.store.sym(subject.split('#')[0])
        let hour = UI.store.statementsMatching(s, p, o, w)
        let hourInt = parseInt(hour[0].object.value)
        console.log('hour', hour[0].object.value)

        p = UI.store.sym('urn:query:day')
        let day = UI.store.statementsMatching(s, p, o, w)
        let dayInt = parseInt(day[0].object.value)
        console.log('day', day[0].object.value)

        if (dayInt % 360 === 0) {
          new Audio('audio/cheer.ogg').play()
        } else if (dayInt % 30 === 0) {
          new Audio('audio/heal.ogg').play()
        }

        document.title =
          (dayInt % 30) +
          ' ' +
          ((dayInt % 360) - (dayInt % 30)) +
          ' ' +
          hourInt +
          ' ' +
          dayInt
        reset(hourInt, dayInt, true)
      },
      err => {
        console.log(err)
      }
    )
  }

  // update timer
  const [seconds, setSeconds] = React.useState(0)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    fetchCount(subject)

    let uri = location.href
    let wss = uri.replace('http', 'ws')
    let w = new WebSocket('wss://melvin.solid.live/')
    w.onmessage = function (m) {
      let data = m.data
      console.log('data', data)
      cogoToast.success(data, { position: 'top-right' })

      if (data.match(/pub .*/)) {
        UI.store = $rdf.graph()
        UI.fetcher = new $rdf.Fetcher(UI.store)
        fetchCount(subject)
        // location.reload()
      }
    }
    w.onopen = function () {
      w.send('sub ' + subject)
    }
  }, [])

  let startTime = localStorage.getItem('startTime') || 0
  let startScore = localStorage.getItem('startScore') || 0
  let c = template.day % 360
  let s = template.day % 30
  let l = c - s
  let t = template.count
  let d = template.day
  let e = Math.floor((new Date().getTime() - startTime) / 1000)
  let a = (1000 - Math.round((e / (s + l - startScore)) * 100)) / 100

  return (
    <div className='is-info'>
      <h1>Burndown Chart (hourly work)</h1>
      <hr />

      <Circle rad={template.count} count={template.day % 360} />

      <hr />

      <div className='buttons'>
        <span className='button is-large is-warning'>S : {s}</span>
        <span className='button is-large is-success'>L : {l}</span>
        <span className='button is-large is-info'>T : {t}</span>
        <span className='button is-large is-link'>D : {d}</span>
        <span className='button is-large is-danger'>E : {e}</span>
        <span className='button is-large is-light'>A : {a}</span>

        <button
          className='button is-large is-info'
          onClick={() => {
            localStorage.setItem('startTime', new Date().getTime())
            localStorage.setItem('startScore', s + l)
            cogoToast.info('Times Reset')
          }}
        >
          Reset
        </button>
      </div>

      <hr />
      {JSON.parse(localStorage.getItem('last') || JSON.stringify([]))
        .reverse()
        .join(' | ')}
      <hr />
    </div>
  )
}

ReactDOM.render(
  <Provider stores={[store]}>
    <NavbarSolidLogin
      className='is-link'
      title='Points App'
      sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/points.html/'
    />

    <div className='section'>
      <div className='container'>
        <div className='columns'>
          <div className='column'>
            <div className='notification is-info'>
              <Points />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Provider>,
  document.getElementById('root')
)

function Circle ({ rad, count, ...props }) {
  var defaultThreshold = 410
  var threshold =
    new URLSearchParams(document.location.search).get('threshold') ||
    defaultThreshold

  if (rad > threshold) {
    rad = threshold
  }

  let percent = rad / threshold
  let red = Math.floor(percent * 212)
  let green = Math.floor(212 - red)
  let factor = threshold / 146.0

  let p = 309 * (count / 360) * percent
  let q = 309 * percent - p

  // console.log(rad, percent, count, p, factor)

  return (
    <svg width='300' height='300'>
      <circle
        cx='150'
        cy='150'
        style={{
          fill: 'rgb(' + red + ', ' + green + ', 0)',
          stroke: 'gold',
          strokeWidth: 11,
          strokeDasharray: p + '% ' + q + '%'
        }}
        r={rad / factor}
      >
        <title>Pie</title>
      </circle>
    </svg>
  )
}
