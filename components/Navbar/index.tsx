const Navbar = () => {
    return (
        <nav className="w-full flex items-center justify-between max-h-[10vh] min-h-[10vh] h-full">
            <div className="w-full h-full flex items-center justify-between max-w-[1440px] px-[32px] md:px-[64px] lg:px-[120px]">
                <h1 className="flex-1">LOGO</h1>
                <ul className="flex-1 flex items-center justify-between">
                    <li>Home</li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;