/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"

import Header from "./header"
import { VaquitaProvider, useVaquita } from "../contexts/VaquitaContext"
import CompletionNotification from "./ui/CompletionNotification"
import "./layout.css"

const VaquitaBar: React.FC = () => {
  const { state, dispatch } = useVaquita()

  const closeCompletion = () => {
    dispatch({ type: 'SHOW_COMPLETION', payload: false });
  };

  return (
    <>
      {state.showCompletion && <CompletionNotification onClose={closeCompletion} />}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: '#fff',
        border: '2px solid #000',
        padding: '0.5rem',
        maxWidth: '200px',
        zIndex: 100,
        transform: 'translateZ(10px)',
        boxShadow: '4px 4px 0 #000',
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem' }}>Vaquita Status</h3>
        {state.participants.map(p => (
          <div key={p.id} style={{
            fontSize: '0.7rem',
            marginBottom: '0.25rem',
            color: p.status === 'paid' ? '#0f0' : '#f00',
            fontWeight: 'bold'
          }}>
            {p.name}: {p.status}
          </div>
        ))}
      </div>
    </>
  )
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <VaquitaProvider>
      <VaquitaBar />
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: `var(--size-content)`,
          padding: `var(--size-gutter)`,
        }}
      >
        <main>{children}</main>
        <footer
          style={{
            marginTop: `var(--space-5)`,
            fontSize: `var(--font-sm)`,
          }}
        >
          © {new Date().getFullYear()} &middot; Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#fff',
        borderTop: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
      }}>
        <Link to="/shared-pay">Shared Pay</Link>
        <Link to="/randomizer">Randomizer</Link>
        <Link to="/value-weight">Value Weight</Link>
        <Link to="/pay-later">Pay Later</Link>
        <Link to="/gallery">Gallery</Link>
      </nav>
    </VaquitaProvider>
  )
}

export default Layout
