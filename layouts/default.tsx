import Navbar from "../components/Navbar"

const Default = (props: any) => {
    return (
        <div className="">
            <Navbar />
            <div className="max-w-[1440px] px-[32px] md:px-[64px] lg:px-[120px]">
                {props.children}
            </div>
        </div>
    )
}

export default Default;