import { useState } from 'react';
import './settings.scss'
import { Icon } from '@iconify/react';
import { SERVER1, SERVER2, setHost, SELECTED_SERVER, HTTP_METHOD, API_HOST } from '../../Database/db';
function Settings(props) {
    let savedServer = localStorage.getItem(SELECTED_SERVER);
    if (savedServer != SERVER1 && savedServer != SERVER2) {
        if (API_HOST.endsWith(SERVER1))
            savedServer = SERVER1;
        else
            savedServer = SERVER2;
    }
    const [server, setServer] = useState(savedServer);
    function selectServer(host) {
        setHost(host);
        localStorage.setItem(SELECTED_SERVER, host);
        setServer(host);
    }
    return (

        <div>
            <div className="snip1265">
                <div className={"plan " + (server == SERVER1 ? "featured" : "")}>
                    <header><i><Icon icon="simple-icons:heroku" color="#f39c12" /></i>
                        <h4 className="plan-title">
                            Heroku Servers
                        </h4>
                        <div className="plan-cost"><span className="plan-type">host </span><span className="plan-price">herokuapp.com</span></div>
                    </header>
                    <ul className="plan-features">
                        <li><a style={{ fontFamily: 'monospace' }}>{HTTP_METHOD + SERVER1}</a>
                        </li>
                        <li> Slow Initial Request
                        </li>
                        <li> 30sec timeout<br></br>(skips some queires if takes longer then 30sec)
                        </li>
                        <li> Unlimited API calls
                        </li>
                        <li> Tested and reliable
                        </li>
                        <li> Monthly limit of 550 free hours
                        </li>
                        <li> 1x	vCPU with 512 MB RAM
                        </li>
                    </ul>
                    {server == SERVER1 ?
                        <div className="plan-select"><a style={{ background: "black" }}>SELECTED</a></div>
                        :
                        <div className="plan-select" onClick={() => selectServer(SERVER1)}><a>Select server</a></div>
                    }
                </div>

                <div className={"plan " + (server == SERVER2 ? "featured" : "")}>
                    <header><i><Icon icon="la:node-js" color="#f39c12" /></i>
                        <h4 className="plan-title">
                            Openode Servers
                        </h4>
                        <div className="plan-cost"><span className="plan-type">host </span><span className="plan-price">openode.com</span></div>
                    </header>
                    <ul className="plan-features">
                        <li><a style={{ fontFamily: 'monospace' }}>{HTTP_METHOD + SERVER2}</a>
                        </li>
                        <li> Constant & fast API request time
                        </li>
                        <li> Unlimited timeout<br></br>(can process more queries taking longer time)
                        </li>
                        <li> Unlimited API calls
                        </li>
                        <li> Less tested
                        </li>
                        <li> Always available
                        </li>
                        <li> shared CPU with 128 MB RAM
                        </li>
                    </ul>
                    {server == SERVER2 ?
                        <div className="plan-select"><a style={{ background: "black" }}>SELECTED</a></div>
                        :
                        <div className="plan-select" onClick={() => selectServer(SERVER2)}><a>Select server</a></div>
                    }
                </div>
            </div>
            <div> </div>
        </div>
    )
}

export default Settings;