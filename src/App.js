import './App.scss';
import React, { Fragment } from 'react';
import Drawer from './components/Drawer/drawer';
import Main from './components/Drawer/Main';
import iconCard from './components/Drawer/icons/reportcard.svg'
import iconCollege from './components/Drawer/icons/college.svg'
import iconCompare from './components/Drawer/icons/compare.svg'
import iconFaq from './components/Drawer/icons/faq.svg'
import iconHome from './components/Drawer/icons/home.svg'
import Student from './components/Student/Student';
import University from './components/University/University';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false, itemSelected: 0, animate: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);

    this.list = [
      ["Home", iconHome],
      ["Student Report", iconCard],
      ["Multi Report", iconCompare],
      ["Predict", iconCollege],
      ["Faq", iconFaq]]
    this.navItemClickListner = this.navItemClickListner.bind(this);
  }
  navItemClickListner(id) {
    console.log("Menu Selected: " + id);
    this.setState(currentState => {
      return { itemSelected: id, animate: false };
    });
  }
  toggleDrawer(e) {
    this.setState(prevState => ({ isOpen: !prevState.isOpen, animate: true }));
  }

  render() {
    let mainComp = <div style={{height:'100%', textAlign:'center'}}><h1>Not implemented yet</h1></div>;
    switch (this.state.itemSelected) {
      case '1':
        mainComp = <Student />
        break;
      case '2':
        mainComp = <University />
        break;
      default:
        console.log(this.state.itemSelected, "was selected");
    }
    console.log("Animate: " + this.state.animate);
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
