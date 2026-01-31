import React from 'react'

import { CiLogin } from "react-icons/ci";
import { RiLoginBoxLine } from "react-icons/ri";
import { MdOutlineContactPhone } from "react-icons/md";
import { FaArrowsToEye } from "react-icons/fa6";
import { GiMirrorMirror } from "react-icons/gi";
import { TbChartCircles } from "react-icons/tb";
import { BsQuestionSquare } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { RiLayout5Line } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import blog from "../../assets/blog.jpg";
import { Link } from 'react-router-dom';

const Resources = () => {
  return (
      <div className="fixed z-50 w-full bg-brand-dark transition-colors duration-300">
            <div className="grid grid-cols-4 max-w-6xl mx-auto relative z-50 bg-brand-dark overflow-visible">
              <div className="flex flex-col px-6 py-7 space-y-4">
                <h2 className="text-text-primary ml-3 text-sm font-bold">Product</h2>
                <Link
                  preventScrollReset={true}
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <CiLogin className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Login
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Simple project management for teams
                    </p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <RiLoginBoxLine className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Sign Up
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Start free trial today
                    </p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <MdOutlineContactPhone className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Contact
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Get in touch with our team
                    </p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/request-demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <FaArrowsToEye className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Demo
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Watch product walkthrough
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col px-6 py-7 space-y-4 ">
                <h2 className="text-text-primary ml-3 text-sm font-bold">Company</h2>
                <Link
                  preventScrollReset={true}
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <GiMirrorMirror className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      About
                    </h2>
                    <p className="text-xs text-text-secondary">Learn our story</p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/careers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <TbChartCircles className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Careers
                    </h2>
                    <p className="text-xs text-text-secondary">Join our team</p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <BsQuestionSquare className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Help
                    </h2>
                    <p className="text-xs text-text-secondary">Support center</p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <CiSearch className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Blog
                    </h2>
                    <p className="text-xs text-text-secondary">Latest insights </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col px-6 py-7 space-y-4  ">
                <h2 className="text-text-primary ml-3 text-sm font-bold">
                  Latest From Blog
                </h2>
                <Link
                  preventScrollReset={true}
                  to="/features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <RiLayout5Line className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Features
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Explore what CollabSpace offers
                    </p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <RiLayout5Line className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Pricing
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Plans built for teams of all sizes{" "}
                    </p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <RiLayout5Line className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Blog
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Insights and tips for better collaboration{" "}
                    </p>
                  </div>
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-brand-light transition-colors"
                >
                  <RiLayout5Line className="text-2xl text-brand" />

                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Contact{" "}
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Get in touch with our team{" "}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="absolute top-0 left-[calc(85%-100px)] w-[600px] flex flex-col px-6 py-7 space-y-4 z-50 bg-brand-dark">
                <h2 className="text-text-primary ml-3 text-sm font-bold">
                  Latest from our blog
                </h2>
                {/* Image container */}
                <div className="w-60 h-34 overflow-hidden rounded-lg">
                  <img
                    src={blog}
                    alt="Blog feature"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 pl-3">
                  <h2 className="text-md font-semibold text-text-primary">
                    Streamline your workflow{" "}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Discover productivity tips for modern teams{" "}
                  </p>
                </div>

                <Link
                  preventScrollReset={true}
                  to="/blog/1"
                  onClick={() => setMobileMenuOpen(false)}
                  className="underline text-md  pl-3 text-text-primary"
                >
                  Read More
                </Link>

                <Link
                  preventScrollReset={true}
                  to="/articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-md font-semibold text-text-primary gap-2 p-3 group transition-colors hover:text-brand"
                >
                  See Articles
                  <IoIosArrowForward className="text-xl transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
  )
}

export default React.memo(Resources)
