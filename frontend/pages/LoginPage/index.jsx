import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form } from 'formik'
import * as Yup from 'yup';
import Cookies from 'js-cookie'
import Input from "../../components/Input";
import { QueryClient, useMutation } from '@tanstack/react-query'
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useContext, useEffect } from "react";
import context from "../../context/Context";
import Image from 'next/image'
import wave from '../../public/images/wave.png'
export default function LoginPage() {
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
        email: "",
        password: "",
        username: ""
    }
    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid Email Format').required('Required'),

        password: Yup.string().required('Required'),

        username: Yup.string().required('Required'),


    });
    const less = useLoginUser()
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
                                        <h2 className="title">Login</h2>


                                        <Input type="text" id="username" name="username" className="input" >Username</Input>


                                        <Input type="email" id="email" name="email" className="input" >Email</Input>


                                        <Input type="password" id="password" name="password" className="input" >Password</Input>



                                        <input type="submit" className="btn !my-5" value="Login" />
                                    </Form>
                                )
                            }
                        }



                    </Formik>
                </div>
            </div>
           
        </div>
    )
}


const LoginUser = (user) => {
    return axios.post('http://127.0.0.1:8000/api/v1/Login/', user, {
        withCredentials: true,
    })
}

const useLoginUser = () => {
    const router = useRouter()
    let { setauth} = useContext(context)
    return useMutation(LoginUser, {
        onSuccess: (response) => {
            console.log(response)
            localStorage.setItem('auth-details',JSON.stringify(response.data))
            setauth(response.data)
            router.push('/')
            toast.success('You Have Logged In Successfully!!!', { position: toast.POSITION.TOP_LEFT })

        },
        onError: (error) => {
            const newerror = error.response.data
            toast.error('Invalid Credentials Please Recheck', { position: toast.POSITION.TOP_LEFT })
        }
    })
}
