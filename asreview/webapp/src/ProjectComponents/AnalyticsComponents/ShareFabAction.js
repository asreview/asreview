import * as React from "react";
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  WeiboShareButton,
  WhatsappShareButton,
} from "react-share";
import { styled } from "@mui/material/styles";
import { asreviewURL } from "globals.js";

const Root = styled("div")(({ theme }) => ({
  display: "none",
}));

const hashtag = "SystematicReview";

export default function ShareFabAction(props) {
  const n_records = props.progressQueryData?.n_records;
  const n_included = props.progressQueryData?.n_included;
  const n_labeled =
    props.progressQueryData?.n_included + props.progressQueryData?.n_excluded;

  const text_en = `I'm using ASReview LAB to systematically review ${n_records} records and found ${n_included} relevant ones after only reviewing ${n_labeled}!`;
  const text_cn = `我在用ASReview LAB对${n_records}篇文献做系统综述(systematic review)。筛选${n_labeled}篇之后，发现了${n_included}篇相关！`;

  return (
    <Root>
      <TwitterShareButton
        ref={props.xRef}
        url={asreviewURL}
        title={text_en}
        via="asreviewlab"
        hashtags={[hashtag]}
      />
      <FacebookShareButton
        ref={props.facebookRef}
        url={asreviewURL}
        quote={text_en}
      />
      <WeiboShareButton
        ref={props.weiboRef}
        url={asreviewURL}
        title={text_cn}
      />
      <WhatsappShareButton
        ref={props.whatsappRef}
        url={asreviewURL}
        title={text_en}
      />
      <EmailShareButton ref={props.emailRef} url={asreviewURL} body={text_en} />
    </Root>
  );
}
