import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";

import ThemeProvider from "@mui/material/styles/ThemeProvider";

import React, {useState} from "react";
import {css} from "@emotion/react";
import {graphql, useStaticQuery} from "gatsby";

import theme from "../theme";

import Api from "../api/api";
import Button from "@mui/material/Button";
import Helmet from "react-helmet";

import OrderFrame from "../components/frames/OrderFrame";

const Confirm = ({location}) => {
    const {state = {}} = location
    const {
        cartProducts,
        address,
        paymentMethod,
        phone,
    } = state

    const api = new Api()

    const data = useStaticQuery(graphql`
{
  site {
    siteMetadata {
      title
      description
    }
  }
}`)

    const [code, setCode] = useState("")
    const [timeToResend, setTimeToResend] = useState(60);
    const [codeError, setCodeError] = useState("")

    setTimeout(() => {
        if (timeToResend !== 0) {
            setTimeToResend(timeToResend - 1)
        }
    }, 1000)

    return <>
        <Helmet htmlAttributes={{
            lang: 'ru',
        }}>
            <title>{data.site.siteMetadata.title} | Подтверждение номера телефона</title>
            <meta name="description" content={data.site.siteMetadata.description}/>
            <link rel="canonical" href="https://gatsby-test-nuk.pages.dev/confirm"/>
        </Helmet>
        <ThemeProvider theme={theme}>
            <OrderFrame title="Подтвердите номер телефона">
                <div css={css`
                      margin-top: 8px;
                      margin-left: 12px;
                    `}>
                    <Typography component="span">
                        Ваш номер телефона:
                    </Typography>
                    <Typography sx={{
                        ml: "8px",
                        fontWeight: "bold"
                    }} component="span">
                        {phone}
                    </Typography>
                </div>

                <FormControl
                    required={true}
                    style={{width: "100%"}}
                    error={codeError !== ""}
                    sx={{mt: '8px', mb: '8px'}}>

                    <InputLabel htmlFor="phone">Код</InputLabel>
                    <Input inputmode="numeric" id="phone" aria-describedby="code" sx={{pl: 1}} value={code}
                           onChange={event => {
                               const prev = event.target.value;
                               setCode(event.target.value)
                               setCodeError("")

                               if (event.target.value.length === 6) {
                                   setTimeout(async () => {
                                       if (event.target.value === prev) {
                                           try {
                                               const result = await api.sendCodeAndOrder(
                                                   cartProducts,
                                                   address,
                                                   paymentMethod,
                                                   phone,
                                                   prev)

                                               if (result.redirect) {
                                                   window.location.replace(result.redirect)
                                               }
                                           } catch (e) {
                                               if (e.code === 1001) {
                                                   setCodeError("Неверный SMS-код");
                                               } else if (e.code === 1004) {
                                                   setCodeError("Срок действия кода истёк");
                                               }
                                           }
                                       }
                                   }, 1000)
                               }
                           }}/>
                    <FormHelperText>
                        {(codeError === "") ? "Код будет проверен автоматически." : codeError}
                    </FormHelperText>
                </FormControl>
                <Button sx={{
                    width: '100%',
                    justifyContent: (timeToResend === 0) ? "center" : "space-between",
                }}
                        disabled={timeToResend !== 0}
                        onClick={async () => {
                            await api.resendCode(JSON.parse(localStorage.getItem("phone")))
                            setTimeToResend(60);
                        }}>
                    Отправить СМС заново
                    {
                        (timeToResend === 0)
                            ? null
                            : <Typography>{timeToResend}</Typography>
                    }
                </Button>
            </OrderFrame>
        </ThemeProvider>
    </>
}

export default Confirm;