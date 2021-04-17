import React from "react";
import './drawer.scss';
import Lottie from 'react-lottie-player';
import animationData from './icons/headanim.json';
import { isMobile } from 'react-device-detect';

function Drawer(props) {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };
    function menuItemClick(e) {
        const data = e.currentTarget.getAttribute("item-id")
        props.navItemClickListner(data)
    }
    let mStyle = { width: props.open ? props.width + "px" : "0px" };
    if (isMobile) {
        mStyle.backgroundColor = "rgba(245, 245, 245, 0.8)";
        mStyle.backdropFilter = "blur(3px)";
    }
    const selected = isMobile?"selected-light":"selected-dark"
    const drawerItems = props.list.map((item, index) =>
        <div key={index} className={(index === Number(props.activeId)) ? selected : ""} onClick={menuItemClick} item-id={index}>
            <img src={item[1]} alt={item[0]} />
            <p>{item[0]}</p>
        </div>
    );
    return (
        <React.Fragment>
            <div className="drawer" style={mStyle}>
                <header>
                    <span style={{ width: props.width, color: isMobile ? 'black' : 'white' }}>Grade Card<br></br>Analyzer</span>
                    <Lottie
                        animationData={animationData}
                        options={defaultOptions}
                        style={{ width: props.width, height: 200}}
                        play={props.open}
                    />
                </header>
                {drawerItems}
            </div>
        </React.Fragment>
    );
}
export default Drawer;