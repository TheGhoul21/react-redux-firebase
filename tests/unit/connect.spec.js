import React, { createClass, Children, Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import firebaseConnect from '../../src/connect'
import reactReduxFirebase from '../../src/compose'
import TestUtils from 'react-addons-test-utils'
import { createStore, compose, combineReducers } from 'redux'
import getDisplayName from 'react-display-name'

describe('Connect', () => {
  class Passthrough extends Component {
    render () {
      return <div>{JSON.stringify(this.props)}</div>
    }
  }

  class ProviderMock extends Component {
    getChildContext () {
      return { store: this.props.store }
    }

    render () {
      return Children.only(this.props.children)
    }
  }

  ProviderMock.childContextTypes = {
    store: PropTypes.object.isRequired
  }

  function stringBuilder (prev = '', action) {
    return action.type === 'APPEND'
      ? prev + action.body
      : prev
  }


  it('should receive the store in the context', () => {
    const createStoreWithMiddleware = compose(
      reactReduxFirebase(fbConfig, { userProfile: 'users' }),
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    )(createStore)
    const store = createStoreWithMiddleware(combineReducers({ test: (state = {}) => state }))

    @firebaseConnect()
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock store={store}>
        <Container pass="through" />
      </ProviderMock>
    )

    const container = TestUtils.findRenderedComponentWithType(tree, Container)
    container.setState({
      testState: 'somethingElse'
    })
    expect(container.context.store).to.equal(store)
  })



  it('sets displayName static as FirebaseConnect${WrappedComponentName}', () => {
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const containerPrime = firebaseConnect()(Container)
    expect(containerPrime.displayName).to.equal(`FirebaseConnect(${getDisplayName(Container)}`)
  })

  it('sets WrappedComponent static as component which was wrapped', () => {
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const containerPrime = firebaseConnect()(Container)
    expect(containerPrime.wrappedComponent).to.equal(Container)
  })

})
