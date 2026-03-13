/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"

import Header from "./header"
import { VaquitaProvider } from "../contexts/VaquitaContext"
import "./layout.css"

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
      </nav>
    </VaquitaProvider>
  )
}

export default Layout

export default Layout
