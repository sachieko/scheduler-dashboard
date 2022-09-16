import React, { Component } from 'react';

export default class Loading extends Component {
  state = {
    loading: true
  }
  render () {
    return <section className="loading">Loading</section>;
  }
}