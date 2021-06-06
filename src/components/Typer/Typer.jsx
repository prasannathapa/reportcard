import { Component } from "react";
import './typer.scss'
const TYPING_SPEED = 180;
const DELETING_SPEED = 30;

class Typer extends Component {
  
  _timer;
  _mounted;
  state = {
    text: '',
    isDeleting: false,
    loopNum: 0,
    typingSpeed: TYPING_SPEED
  }

  componentDidMount() {
    this._mounted = true;
    this.handleType();
  }

  handleType = () => {
    const { dataText } = this.props;
    const { isDeleting, loopNum, text, typingSpeed } = this.state;
    const i = loopNum % dataText.length;
    const fullText = dataText[i].substring(0, Math.min(this.props.maxLength||dataText[i].length, dataText[i].length));

    this.setState({
      text: isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1),
      typingSpeed: isDeleting ? DELETING_SPEED : TYPING_SPEED
    });

    if (!isDeleting && text === fullText) {     
      setTimeout(() => {if(this._mounted)this.setState({ isDeleting: true })}, 500);   
    } else if (isDeleting && text === '') {
      this.setState({
        isDeleting: false,
        loopNum: loopNum + 1
      });      
    }

    this._timer = setTimeout(this.handleType, typingSpeed);
  };
  componentWillUnmount(){
    clearTimeout(this._timer);
    this._mounted = false;
  }

  render() {
    return (
      <div className={this.props.className} style={{color:this.props.color}}>
        <span style={{letterSpacing:this.props.spacing||0, paddingRight:0}}>{ this.state.text }</span>
        <span id="cursor"></span>
      </div>
    );
  }
}
export default Typer;