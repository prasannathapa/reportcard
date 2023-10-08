import { useState } from 'react';
import './settings.scss'
import { Icon } from '@iconify/react';
import { DEFAULT_SERVER, CUSTOM_SERVER, setHost, SELECTED_SERVER, HTTP_METHOD, API_HOST } from '../../Database/db';
function Settings(props) {
    let savedServer = localStorage.getItem(SELECTED_SERVER);
    if (API_HOST.endsWith(DEFAULT_SERVER))
        savedServer = DEFAULT_SERVER;
    else
        savedServer = CUSTOM_SERVER;
    
    const [server, setServer] = useState(savedServer);
    function selectServer(host) {
        setHost(host);
        if(host !== DEFAULT_SERVER){
            localStorage.setItem(SELECTED_SERVER, host);
        } else {
            localStorage.removeItem(SELECTED_SERVER);
        }
        setServer(host);
    }
    const [input, setInput] = useState(savedServer || DEFAULT_SERVER);
    return (

        <div>
            <div className="snip1265">
                <div className={"plan " + (server === DEFAULT_SERVER ? "featured" : "")}>
                    <header><i><Icon icon="mdi:aws" color="#f39c12" /></i>
                        <h4 className="plan-title">
                            Primary Servers
                        </h4>
                        <div className="plan-cost"><span className="plan-type">host </span><span className="plan-price">prasannathapa.in</span></div>
                    </header>
                    <ul className="plan-features">
                        <li><a style={{ fontFamily: 'monospace' }}>{HTTP_METHOD + DEFAULT_SERVER}</a>
                        </li>
                        <li> Fastest feature updates (if any)
                        </li>
                        <li> unlimited timeout<br></br>(no skiping queires if takes longer then 30sec)
                        </li>
                        <li> Unlimited API calls
                        </li>
                        <li> Tested and reliable
                        </li>
                        <li> It costs me, so if I go broke this will go down
                        </li>
                        <li> AWS Servers
                        </li>
                    </ul>
                    {server == DEFAULT_SERVER ?
                        <div className="plan-select"><a style={{ background: "black" }}>SELECTED</a></div>
                        :
                        <div className="plan-select" onClick={() => selectServer(DEFAULT_SERVER)}><a>Select server</a></div>
                    }
                </div>

                <div className={"plan " + (server == CUSTOM_SERVER ? "featured" : "")}>
                    <header><i><Icon icon="la:node-js" color="#f39c12" /></i>
                        <h4 className="plan-title">
                            Custom Servers
                        </h4>
                        <div className="plan-cost"><span className="plan-type">host </span><span className="plan-price"><input id={'input'} value={input} onInput={e => setInput(e.target.value)} /></span></div>
                    </header>
                    <ul className="plan-features">
                        <li><a style={{ fontFamily: 'monospace' }}>{HTTP_METHOD + CUSTOM_SERVER}</a>
                        </li>
                        <li> Use your own server 
                        </li>
                        <li> Customise <br></br>(the way you want)
                        </li>
                        <li> Set your won restrictions API calls
                        </li>
                        <li> Keep your data private
                        </li>
                        <li> We both go broke then only its down
                        </li>
                        <li> you can use a super computer if you want
                        </li>
                        
                    </ul>
                    {server == input ?
                        <div className="plan-select"><a style={{ background: "black" }}>SELECTED</a></div>
                        :
                        <div className="plan-select" onClick={() => selectServer(input)}><a>Select server</a></div>
                    }
                </div>
            </div>
            <div> </div>
        </div>
    )
}

export default Settings;
