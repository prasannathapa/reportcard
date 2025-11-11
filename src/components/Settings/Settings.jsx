import { useState } from 'react';
import './settings.scss'
import { Icon } from '@iconify/react';
// CUSTOM_SERVER is imported but its value can be stale.
// The component's internal 'server' state is more reliable for UI logic.
import { DEFAULT_SERVER, CUSTOM_SERVER, setHost, SELECTED_SERVER, HTTP_METHOD, API_HOST } from '../../Database/db';

function Settings(props) {
    let savedServer = localStorage.getItem(SELECTED_SERVER);
    if (API_HOST.endsWith(DEFAULT_SERVER))
        savedServer = DEFAULT_SERVER;
    else
        // If savedServer is null (first load, no custom), API_HOST won't end with DEFAULT_SERVER
        // but savedServer is still null. CUSTOM_SERVER is also null.
        // This logic is a bit tangled. Let's simplify.
        savedServer = localStorage.getItem(SELECTED_SERVER) || DEFAULT_SERVER;

    const [server, setServer] = useState(savedServer);
    const isDefault = server === DEFAULT_SERVER;

    function selectServer(host) {
        setHost(host); // This updates the global API_HOST
        if (host !== DEFAULT_SERVER) {
            localStorage.setItem(SELECTED_SERVER, host);
        } else {
            localStorage.removeItem(SELECTED_SERVER);
        }
        setServer(host); // This updates this component's state
    }

    // This is correct: Set input to the custom server URL if it's active, otherwise empty.
    const [input, setInput] = useState(isDefault ? '' : savedServer);

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
                    {server === DEFAULT_SERVER ?
                        <div className="plan-select"><a style={{ background: "black" }}>SELECTED</a></div>
                        :
                        <div className="plan-select" onClick={() => selectServer(DEFAULT_SERVER)}><a>Select server</a></div>
                    }
                </div>

                {/* --- FIX ---
                    The "featured" class should depend on whether the *active* server
                    is the default one, not the stale imported CUSTOM_SERVER.
                */}
                <div className={"plan " + (server !== DEFAULT_SERVER ? "featured" : "")}>
                    <header><i><Icon icon="la:node-js" color="#f39c12" /></i>
                        <h4 className="plan-title">
                            Custom Servers
                        </h4>
                        <div className="plan-cost"><span className="plan-type">host </span><span className="plan-price"><input id={'input'} value={input} onInput={e => setInput(e.target.value)} placeholder="e.g., localhost:8080" /></span></div>
                    </header>
                    <ul className="plan-features">

                        {server !== DEFAULT_SERVER ? (
                            <li> <a style={{ fontFamily: 'monospace' }}>{HTTP_METHOD + server}</a></li>
                        ) : (
                            input && <li> <a style={{ fontFamily: 'monospace' }}>{HTTP_METHOD + input}</a></li>
                        )}

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
                    {/* This logic for disabling the button looks correct */}
                    {server === input && DEFAULT_SERVER !== input ?
                        <div className="plan-select"><a style={{ background: "black" }}>SELECTED</a></div>
                        :
                        (input === "" || DEFAULT_SERVER === input ?
                            <div className="plan-select" disabled><a style={{ background: "grey" }}>Select server</a></div>
                            :
                            <div className="plan-select" onClick={() => selectServer(input)}><a>Select server</a></div>
                        )
                    }
                </div>
            </div>
            <div>&nbsp;</div> {/* Replaced blank space with &nbsp; for clarity */}
        </div>
    )
}

export default Settings;