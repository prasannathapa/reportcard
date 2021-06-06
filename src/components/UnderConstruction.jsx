import Lottie from 'react-lottie-player';
import animationData from './construction.json';
function NotImplemented() {
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };
    return (
        <div style={{ height: '100%', alignItems: 'center', display: "flex" }}>
            <Lottie
                animationData={animationData}
                options={defaultOptions}
                style={{ width: 360, height: 360, margin:'auto'}}
                play
                loop
            />
        </div>
    )
}
export default NotImplemented;