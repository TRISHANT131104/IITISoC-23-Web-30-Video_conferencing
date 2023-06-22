import React from 'react'
import { Field, ErrorMessage } from 'formik'
import { useEffect } from 'react';
export default function Input(props1) {
    const { children, id, type, name, className, icon, label, ...rest } = props1
    useEffect(() => {
        const inputs = document.querySelectorAll(".input");

        function addClass() {
            let parent = this.parentNode.parentNode;
            parent.classList.add("focus");
        }

        function removeClass() {
            let parent = this.parentNode.parentNode;
            if (this.value == "") {
                parent.classList.remove("focus");
            }
        }

        inputs.forEach((input) => {
            input.addEventListener("focus", addClass);
            input.addEventListener("blur", removeClass);
        });

    }, []);
    return (
        <div id="input" className=''>

            <div className=''>


                <Field as={props1.as} name={name}  {...rest}>
                    {
                        (props2) => {

                            const { field, form, meta } = props2

                            return (

                                <div className='flex '>


                                    <div className="input-div pass !w-full">
                                        <div className="i">
                                            {icon}
                                        </div>
                                        <div className="div">
                                            <h5 className='!w-full !text-center '>{children}</h5>
                                            <input {...field} type={type} name={name} id={id} className="input" />
                                        </div>
                                    </div>

                                    <div className='translate-y-[20px] text-red-500'>
                                        <ErrorMessage className='' name={name}>
                                            {msg => {
                                                return (
                                                    <div className="">
                                                        <p className='p-1 text-center text-red-500 bg-white '>{msg}</p>
                                                    </div>
                                                )
                                            }}

                                        </ErrorMessage>
                                    </div>
                                </div>

                            )



                        }
                    }
                </Field>




            </div>


            

        </div>

    )
}