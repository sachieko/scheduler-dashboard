import React, { Component } from 'react';
import axios from 'axios';
import classnames from 'classnames';

import Loading from './Loading';
import Panel from './Panel';
import {
  getInterviewsPerDay,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getTotalInterviews
} from 'helpers/selectors';
import { setInterview } from 'helpers/reducers';

const data = [
  {
    id: 1,
    label: 'Total Interviews',
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: 'Least Popular Time Slot',
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: 'Most Popular Day',
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: 'Interviews Per Day',
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  }

  componentDidMount() {
    Promise.all([
      axios.get('/api/days'),
      axios.get('/api/appointments'),
      axios.get('/api/interviewers')
    ])
      .then(([days, appointments, interviewers]) => {
        this.setState({
          loading: false,
          days: days.data,
          appointments: appointments.data,
          interviewers: interviewers.data
        });
      })
      .catch(err => console.log('Uh oh, something went horribly wrong: ', err.message));

    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);

      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(prevState => setInterview(prevState, data.id, data.interview));
      }
    };

    const focused = JSON.parse(localStorage.getItem('focused'));

    if (focused) {
      this.setState({ focused });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.focused !== this.state.focused) {
      localStorage.setItem('focused', JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  selectPanel(id) {
    this.state.focused ? this.setState({ focused: null }) : this.setState({ focused: id });
  }

  render() {
    const dashboardClasses = classnames('dashboard', { 'dashboard--focused': this.state.focused });

    if (this.state.loading) {
      return <Loading />
    }

    console.log(this.state);

    const panels = (this.state.focused ? data.filter(panel=> this.state.focused === panel.id) : data).map(panel => {
      return <Panel key={panel.id} id={panel.id} label={panel.label} value={panel.getValue(this.state)} onSelect={() => this.selectPanel(panel.id)} />
    });

    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;
