import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import WalletQuery from 'queries/Wallet'

import Link from 'components/Link'
import NavLink from 'components/NavLink'
import Profile from './nav/Profile'
import Notifications from './nav/Notifications'
import Messages from './nav/Messages'
import Confirmations from './nav/Confirmations'
import Sell from './nav/Sell'

class Nav extends Component {
  state = {}

  render() {
    const navProps = nav => ({
      onOpen: () => this.setState({ open: nav }),
      onClose: () => this.setState({ open: false }),
      open: this.state.open === nav
    })

    return (
      <nav className="navbar navbar-expand-md">
        <div className="container">
          <Link to="/" className="navbar-brand">
            Origin
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <Query query={WalletQuery}>
                {({ data }) => {
                  if (!get(data, 'web3.metaMaskAccount.id'))
                    return (
                      <>
                        <li className="nav-item">
                          <a className="nav-link" href="#">
                            Get Started
                          </a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#">
                            Sell on Origin
                          </a>
                        </li>
                      </>
                    )

                  return (
                    <>
                      <li className="nav-item extra-margin">
                        <NavLink to="/my-purchases" className="nav-link text">
                          Buy
                        </NavLink>
                      </li>
                      <Sell {...navProps('sell')} />
                      <li className="nav-item extra-margin">
                        <NavLink
                          to="/create"
                          className="nav-link add-listing text"
                        >
                          Add Listing
                        </NavLink>
                      </li>
                      <Confirmations {...navProps('confirmations')} />
                      <Messages {...navProps('messages')} />
                      <Notifications {...navProps('notifications')} />
                      <Profile {...navProps('profile')} />
                    </>
                  )
                }}
              </Query>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

export default Nav

require('react-styl')(`
  .navbar
    padding: 0 1rem
    background-color: var(--dusk) !important

    .nav-item
      display: flex
      align-items: center
      min-height: 3.75rem
      font-family: Lato
      font-size: 14px
      font-weight: bold
      font-style: normal
      color: var(--pale-grey)
      &.extra-margin
        margin: 0 0.5rem
      &.show
        background-color: var(--white)
        .nav-link
          color: var(--dark)
      &.dark
        &.show
          background-color: var(--dark)
      .nav-link
        padding: 0 0.75rem
        color: var(--pale-grey)
        &.text
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          &:hover,&.active
            background-color: var(--dark-grey-blue);
        &.add-listing
          display: inline-block
          padding-left: 2rem
          background: url(images/add-listing-icon.svg) no-repeat 0.5rem center
          background-size: 1rem

      .dropdown-menu
        padding: 0
        margin-top: 1rem
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
        border-radius: 5px 0 5px 5px
        border: 0
        font-weight: normal
        border-radius: 5px 0 5px 5px

        &::before
          width: 1rem
          height: 1rem
          color: var(--white)
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          clip-path: polygon(150% -50%, 150% 150%, 100% 150%, 100% 100%, -10% 100%)
          font-size: 1rem
          line-height: 1rem
          content: "◢"
          position: absolute
          top: -1rem
          right: 0

        &.dark
          color: var(--white)
          background-color: var(--dark)
          border: 0
          box-shadow: none
          &::before
            color: var(--dark)
            text-shadow: none


  .navbar-brand
    background: url(images/origin-logo.svg) no-repeat center
    width: 90px
    text-indent: -9999px
`)
