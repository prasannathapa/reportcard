import './App.scss';
import React, { Fragment } from 'react';
import Drawer from './components/Drawer/drawer';
import Main from './components/Drawer/Main';
import iconCard from './components/Drawer/icons/reportcard.svg'
import iconCollege from './components/Drawer/icons/college.svg'
import iconAI from './components/Drawer/icons/ai.svg'
import iconCompare from './components/Drawer/icons/compare.svg'
import iconFaq from './components/Drawer/icons/faq.svg'
import iconServer from './components/Drawer/icons/server.svg'
import iconHome from './components/Drawer/icons/home.svg'
import iconBook from './components/Drawer/icons/book.svg'
import iconSearch from './components/Drawer/icons/search.svg'
import MultiReport from './components/MultiReport/MultiReport'
import Student from './components/Student/Student';
import { isMobile } from 'react-device-detect';
import Home from './components/Home/Home';
import NotImplemented from './components/UnderConstruction';
import CollegeReport from './components/CollegeReport/CollegeReport';
import StudentCompare from './components/StudentCompare/StudentCompare';
import SubjectReport from './components/SubjectReport/SubjectReport';
import Settings from './components/Settings/Settings';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: !isMobile, itemSelected: '0', animate: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);

    this.list = [
      ["Home", iconHome],
      ["Student Report", iconSearch],
      ["Multi Report", iconCard],
      ["College Report", iconCollege],
      ["Subject Report", iconBook],
      ["Compare Student", iconCompare],
      ["Predict", iconAI],
      ["Server", iconServer]]
    this.navItemClickListner = this.navItemClickListner.bind(this);
    if (localStorage.getItem("ver") !== "1.15")
      localStorage.clear();
    localStorage.setItem("ver", "1.15")
  }
  navItemClickListner(id) {
    //console.log("Menu Selected: " + id);
    let drawerState = this.state.isOpen, animate = false;
    if (drawerState && isMobile) {
      drawerState = false;
      animate = true;
    }
    this.setState(currentState => {
      return { itemSelected: id, animate: isMobile ? animate : false, isOpen: drawerState };
    });
  }
  toggleDrawer(e) {
    this.setState(prevState => ({ isOpen: !prevState.isOpen, animate: true }));
  }

  render() {
    let mainComp = <NotImplemented />;
    switch (this.state.itemSelected) {
      case '0':
        mainComp = <Home />
        break;
      case '1':
        mainComp = <Student text="" />
        break;
      case '2':
        mainComp = <MultiReport />
        break;
      case '3':
        mainComp = <CollegeReport />
        break;
      case '4':
        mainComp = <SubjectReport />
        break;
      case '5':
        mainComp = <StudentCompare />
        break;
      case '7':
        mainComp = <Settings />
        break;
      default:
        //console.log(this.state.itemSelected, "coming soon");
    }
    //console.log("Animate: " + this.state.animate);
    return (
      <Fragment>
        <Drawer width={280} list={this.list} navItemClickListner={this.navItemClickListner} open={this.state.isOpen} activeId={this.state.itemSelected}></Drawer>
        <Main width={280} open={this.state.isOpen} toggler={this.toggleDrawer} animate={this.state.animate}>
          {mainComp}
        </Main>
      </Fragment>
    );
  }
}


export default App;
