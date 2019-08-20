// main
var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

var subject =
  new URLSearchParams(document.location.search).get('uri') ||
  'https://melvin.solid.live/public/activity/' +
    new Date()
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '/') +
    '/activity.ttl'

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
    throw new Error('Provided store instance did not initialize correctly!')
  }

  return instance
}

var activities = []

const store = () => {
  let initial = {}
  initial.count =
    new URLSearchParams(document.location.search).get('count') || 0

  const [template, setTemplate] = React.useState(initial)

  const increment = amount => setTemplate({ count: count + amount })

  const decrement = () => setTemplate({ count: count + 30 })

  const reset = (count, updated, activity) => {
    count = count || 0

    setTemplate({ count: count, updated: updated })
  }

  return { template, increment, decrement, reset }
}

function Activity () {
  const { template, reset } = useStore(store)

  function fetchCount (subject) {
    console.log('fetching', subject)

    UI.fetcher.load(subject, { force: true }).then(
      response => {
        let s = null
        let p = AS('summary')
        let o = null
        let w = UI.store.sym(subject.split('#')[0])
        let hour = UI.store.statementsMatching(s, p, o, w)
        let hourInt = hour[0].object.value

        cogoToast.info(hourInt, {
          position: 'bottom-right',
          heading: 'Melvin Carvalho',
          hideAfter: 60
        })

        activities = []
        for (const a in hour) {
          let subject = hour[a].subject
          let s = subject
          let p = AS('summary')
          let summary = UI.store.anyValue(s, p)

          p = AS('updated')
          let updated = UI.store.anyValue(s, p)

          activities.push({ time: updated, text: summary })
        }

        console.log('activities', activities)

        activities = activities.sort(function (a, b) {
          return b.updated < a.updated ? -1 : b.updated > a.updated ? 1 : 0
        })
        reset(summary, updated, summary)
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

      if (data.match(/pub .*/)) {
        UI.store = $rdf.graph()
        UI.fetcher = new $rdf.Fetcher(UI.store)
        fetchCount(subject)
      }
    }
    w.onopen = function () {
      w.send('sub ' + subject)
    }
  }, [])

  function getCodeLinesFromActivies (activities) {
    var ret = {}
    let code = 0
    let total = activities.length
    for (const i in activities) {
      let a = activities[i]
      if (a.text.match(/code/)) {
        code++
      }
    }
    return {
      code: code,
      percent: Math.round((code * 10000) / total) / 100,
      total: total
    }
  }

  const code = getCodeLinesFromActivies(activities)

  const reversed = activities.slice().reverse()
  const activityList = reversed.map(function (activity) {
    return (
      <div>
        <ActivityItem activity={activity} />
      </div>
    )
  })

  return (
    <div className='is-info'>
      <h1>
        Activity Stream :{' '}
        <span style={{ color: '#369' }}>
          code {code.code} / {code.total}
        </span>{' '}
        = <span style={{ color: 'green' }}>{code.percent}</span>
        {'%'}
      </h1>

      <hr />
      {activityList}
    </div>
  )
}

function ActivityItem (props) {
  var icon = 'fa-keyboard-o'
  var color = 'black'
  if (props.activity.text.match(/Developed/)) {
    icon = 'fa-rocket'
    color = 'blue'
  }
  if (props.activity.text.match(/code/)) {
    icon = 'fa-code'
    color = 'green'
  }
  if (props.activity.text.match(/content/)) {
    icon = 'fa-bar-chart'
    color = 'red'
  }
  if (props.activity.text.match(/shell/)) {
    icon = 'fa-terminal'
    color = 'cyan'
  }
  if (props.activity.text.match(/media/)) {
    icon = 'fa-television'
    color = 'DarkRed'
  }
  if (props.activity.text.match(/issue/)) {
    icon = 'fa-github'
    color = 'SteelBlue'
  }
  if (props.activity.text.match(/design/)) {
    icon = 'fa-hand-o-up'
    color = 'YellowGreen'
  }
  if (props.activity.text.match(/research/)) {
    icon = 'fa-book'
    color = 'Lime'
  }
  icon += ' fa'
  return (
    <div>
      <a
        style={{ color: '#369' }}
        href='https://melvincarvalho.com/#me'
        target='_blank'
      >
        Melvin Carvalho
      </a>{' '}
      <span className={icon} />{' '}
      <span style={{ color: color }}>{props.activity.text}</span>{' '}
      <sub style={{ color: 'rgb(136,136,136)' }}>
        {' '}
        ({moment.utc(props.activity.time).fromNow()})
      </sub>
    </div>
  )
}

ReactDOM.render(
  <Provider stores={[store]}>
    <NavbarSolidLogin
      className='is-link'
      title='Activity App'
      sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/activity.html/'
    />

    <div className='section'>
      <div className='container'>
        <div className='columns'>
          <div className='column'>
            <div className='notification is-info'>
              <Activity />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Provider>,
  document.getElementById('root')
)
