import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import ViewSingleReport from './view_single_report';
import Dialog from '@material-ui/core/Dialog';
import { Redirect } from 'react-router';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';
import amber from '@material-ui/core/colors/amber';
import orange from '@material-ui/core/colors/orange';
import blue from '@material-ui/core/colors/blue';

// All the following keys are optional.
// We try our best to provide a great default value.
const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: orange,
    // error: red,
    // type: process.env.NODE_ENV == 'production' ? 'light' : 'dark',
    // contrastThreshold: 3,
    // Used to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    // tonalOffset: 0.2,
  },
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true,
  },
});

const SessionContext = React.createContext()
class SessionProvider extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			loginState: this.props.loginState,
			snack: {
				open: false,
				msg: '',
			},
			report: {
				open: false,
				schedule: false,
				report: {reports: []},
			},
		}

		this.state.openSnack = this.openSnack.bind(this);
		this.state.openReport = this.openReport.bind(this);

		this.state.handleLoginStatusChange = this.props.handleLoginStatusChange.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props.loginState !== prevProps.loginState) {
			this.setState({
				loginState: this.props.loginState
			})
		}
	}

	openSnack = (msg) => {
    this.setState({
			snack: {
				open: true,
				msg: msg,
			}
		});
	}

  closeSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
			snack: {
				open: false,
				msg: '',
			}
		});
  };

  openReport = (report) => {
		report.reports = [];
		this.setState({
		report: {
			open: true,
			edit: false,
			loading: true,
			report: report,
		}
		});

		fetch(process.env.API_URL + '/getReportsForDef', {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				definitionId: report._id,
			})
		})
			.then(response => response.json())
			.then(data => {
				if (!data.isLoggedIn){
					console.log('Not logged in');
					this.state.handleLoginStatusChange(false);
					return;
				}
				report = this.state.report;
				report.report.reports = data.reports;
				report.loading = false;
				// report.reports = [];
				this.setState({
					report: report
				});
			});
  };

  closeReport = () => {
		const report = this.state.report;
		report.open = false;
    this.setState({ report: report });
  };

	render() {
		// if (this.state.report.schedule){
		// 	console.log(process.env.API_URL + '/schedule/' + this.state.report.report._id);
		// 	return <Redirect push to={process.env.API_URL + '/schedule/' + this.state.report.report._id} />;
		// }
		return (
			<SessionContext.Provider value={this.state}>
				<MuiThemeProvider theme={theme}>
					{this.props.children}


					<ViewSingleReport
						report={this.state.report}
						fn={{closeReport: this.closeReport}}
            analyst={this.props.loginState.analyst}
					/>
					<Snackbar
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
						open={this.state.snack.open}
						autoHideDuration={6000}
						onClose={this.closeSnack}
						ContentProps={{ 'aria-describedby': 'message-id', }}
						message={<span id="message-id">{this.state.snack.msg}</span>}
						action={[
							<IconButton key="close" aria-label="Close" color="inherit"
								onClick={this.closeSnack}
							>
								<CloseIcon />
							</IconButton>,
						]}
					/>
				</MuiThemeProvider>
			</SessionContext.Provider>
		)
	}
}

export { SessionContext, SessionProvider };