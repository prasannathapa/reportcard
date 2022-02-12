import { Component } from "react";
import './SearchList.scss';
import deleteIcon from './icon/delete.svg';
import { toast, ToastContainer } from "react-toastify";
import { isMobile } from "react-device-detect";

class SearchList extends Component {
    constructor(props) {
        super(props);
        this.listItemClicked = this.listItemClicked.bind(this);
        let internalList = {};
        for (let i in props.list)
            internalList[i] = false;
        this.state = { selectedList: internalList, numberOfselection: 0 }
    }

    listItemClicked(event, key) {

        let list = this.state.selectedList;
        let total = this.state.numberOfselection;
        let selectedStatus = list[key];
        let maxSelection = this.props.maxSelection || Number.POSITIVE_INFINITY;
        if ((maxSelection > total && !selectedStatus) || selectedStatus) {
            list[key] = !selectedStatus;
            this.props.ItemClickUpdate(key, !selectedStatus, total);
            total += selectedStatus ? -1 : 1;
            this.setState({ selectedList: list, numberOfselection: total });
        } else {
            let msg = this.props.maxLimitReachMsg || "You can only select " + this.props.maxSelection + " items atmost";
            toast(msg, { type: toast.TYPE.ERROR })

        }

    }
    render() {
        return (
            <div>
                <div className="college-list">
                    <ToastContainer />
                    {Object.entries(this.props.list).map(([k, v]) => {
                        if (this.state.selectedList[k] ||
                            v.toLocaleLowerCase().search((this.props.filterText.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&') || "#").toLocaleLowerCase()) != -1 ||
                            k.toLocaleLowerCase().search((this.props.filterText.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&') || "#").toLocaleLowerCase()) != -1)
                            return (
                                <div key={k} className="item-container" onClick={e => this.listItemClicked(e, k)}>
                                    <div>{v}</div>
                                    {this.state.selectedList[k] &&
                                        <img className="search-logo" alt="search icon" src={deleteIcon} />
                                    }
                                </div>
                            )
                        else
                            return null;
                    })}
                    {!isMobile && !this.props.hideGradient &&
                        <div style={{ height: "50px" }}></div>
                    }
                </div>
                {!isMobile && !this.props.hideGradient &&
                    <div className="gradientback"></div>
                }
            </div>
        );
    }
}
export default SearchList;