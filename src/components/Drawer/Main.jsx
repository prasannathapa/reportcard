import { Fragment } from "react";
import Lottie from "react-lottie-player";
import './drawer.scss';
import menuAnim from './icons/menu.json'
import { BrowserView, MobileView } from 'react-device-detect';
function Main(props) {

    let mStyle = { marginLeft: props.open ? props.width + "px" : "0px" }
    let start = 0, end = 17;
    if (!props.open) { start += 16; end += 15 }
    if (!props.animate) { end = start; }
    let translate = "translate(" + (-20 + (props.open ? props.width : 0)) + "px,-20px)";
    console.log("Main Rendered, anim drawer icon: " + props.animate);

    return (
        <Fragment>
            <BrowserView>
                <div className="main" id="main" style={mStyle}>

                    <div className="header">
                        <Lottie
                            onClick={props.toggler}
                            animationData={menuAnim}
                            style={{ width: 100, height: 100, position:"fixed"}}
                            speed={0.8}
                            play={props.animate}
                            loop={false}
                            segments={[start, end]}
                        />
                    </div>
                    {props.children}

                </div>
            </BrowserView>
            <MobileView>
                <div className="main"  id="main">
                    <div className="header" >
                        <Lottie
                            onClick={props.toggler}
                            animationData={menuAnim}
                            style={{position:"fixed", width: 100, height: 100, transform: translate, transition:"0.5s"}}
                            speed={0.8}
                            play={props.animate}
                            loop={false}
                            segments={[start, end]}
                        />
                    </div>
                    {props.children}
                </div>
            </MobileView>
        </Fragment>
    );

}
export default Main;