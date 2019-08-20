
/** Displays a Card by value. */
export default function Card({ title, ...props }) {
  return (
    <div>
      <section className="section">
        <h1 id="welcome" className="title">
          <div className="card">
            <header className="card-header">
              <p className="card-header-title">
                {title}
              </p>
              <a href="#" className="card-header-icon" aria-label="more options">
                <span className="icon">
                  <i className="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </a>
            </header>
            <div className="card-content">
              {props.children}
            </div>
          </div>

        </h1>
      </section>

    </div>
  )
}


