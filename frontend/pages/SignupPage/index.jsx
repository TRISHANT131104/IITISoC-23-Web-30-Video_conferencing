import React from 'react'
import { useEffect } from 'react'
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import {useRouter} from 'next/router'
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { Formik, Form } from 'formik'
import * as Yup from 'yup';
import Input from "../../components/Input";
import wave from '../../public/images/wave.png'
import Image from 'next/image'
export default function SignupPage() {
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


    const initialValues = {
        email: '',
        password: '',
        username: '',
        confirm_password: '',
    }

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid Email Format!').required('Required!').min(5, 'Atleast 5 characters required!'),

        password: Yup.string().required('Required!').matches(/^(?=.{6,})/, "Must Contain 6 Characters!")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])/,
                "Must Contain One Uppercase, One Lowercase!"
            )
            .matches(
                /^(?=.*[!@#\$%\^&\*])/,
                "Must Contain One Special Case Character!"
            )
            .matches(/^(?=.{6,20}$)\D*\d/, "Must Contain One Number!"),

        username: Yup.string().required('Required!').min(5, 'Atleast 5 characters required!'),

        confirm_password: Yup.string().required('Required!')
            .test('passwords-match', 'Passwords must match!', function (value) {
                return this.parent.password === value
            })
    })

    const less = useCreateUser()
    const onSubmit = (values) => {

        less.mutate(values)

    }
    return (
        <div id="auth">
             <Image placeholder="blur" className="wave" width={800} height={400} src={wave} />
            <div className="container">
                <div className="img"></div>
                <div className="login-content">
                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                        {
                            formik => {
                                return (
                                    <Form>
                                        <div className='w-full flex justify-center'>
                                            <img src="https://www.htmlhints.com/demo/form/animatedLoginForm/img/avatar.svg" />
                                        </div>
                                        <h2 className="title">Signup</h2>

                                        
                                        <Input type="text" id="username" name="username" className="input" >Username</Input>


                                        <Input type="email" id="email" name="email" className="input" >Email</Input>


                                        <Input type="password" id="password" name="password" className="input" >Password</Input>


                                        <Input type="confirm_password" id="confirm_password" name="confirm_password" className="input" >Confirm Password</Input>



                                        <input type="submit" className="btn !my-5" value="Signup" />
                                    </Form>
                                )
                            }
                        }



                    </Formik>
                </div>
            </div>
            <style jsx>
                {`
                    * {
                        padding: 0;
                        margin: 0;
                        box-sizing: border-box;
                      }
                      
                      body {
                        font-family: "Poppins", sans-serif;
                        overflow: hidden;
                      }
                      
                      
                      
                `}
            </style>
        </div>
    )
}



const CreateUser = (user) => {
    
    return axios.post('your api post request for signup',user)
}

const useCreateUser = () => {
    const router = useRouter()
    return useMutation(CreateUser, {
        onSuccess: (response) => {

            router.push('/')
            toast.success('HEY!!! You Have Sigged In Succesfully')
        },
        onError: (error) => {
            const newerror = error.response.data
            
            if(error.message=="Network Error"){
                toast.error('Network Error Please Try After Some Time', { position: toast.POSITION.TOP_LEFT })
            }
            if (newerror.username || newerror.error) {
                toast.error(newerror.username?newerror.username[0]:newerror.error[0], { position: toast.POSITION.TOP_LEFT })
                
            }
            else{
                toast.error('Signup Unsuccesful Retry Again Later', { position: toast.POSITION.TOP_LEFT })
            }
            
            
        }
    })
}