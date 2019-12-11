import React from "react";

const SvgSendMessage = ({ message, ...props }) => (
  <svg width={80} height={80} {...props}>
    <g fill="none" fillRule="evenodd">
      <path fill="#FFF" d="M0 80h80V30.493H0z" />
      <path
        fill="#373B44"
        d="M40 27.333c1.03 0 1.865.834 1.865 1.864v3.75a1.865 1.865 0 01-3.729 0v-3.75c0-1.03.834-1.864 1.864-1.864zm9.579-15.89a1.865 1.865 0 01-2.637 0l-5.077-5.078v16.25a1.865 1.865 0 01-3.73 0V6.365l-5.077 5.078a1.864 1.864 0 11-2.636-2.637l8.26-8.26A2.024 2.024 0 0138.86.39l.028-.022.048-.034c.009-.006.017-.013.026-.018l.05-.033.027-.016.05-.029.03-.016a1.1 1.1 0 01.082-.042l.045-.02.04-.018.04-.015c.015-.006.03-.013.046-.018l.036-.012c.017-.006.035-.01.052-.017l.032-.009.056-.015a.325.325 0 01.03-.007l.059-.013.03-.006.06-.009.035-.005.054-.006.048-.004c.015 0 .029-.002.043-.003a2.886 2.886 0 01.185 0l.042.003.048.004c.019.001.037.004.055.006l.035.005.059.01.03.005c.02.004.04.01.06.013l.029.007.057.015.032.01.052.016.035.012c.016.005.03.012.047.018l.04.015.04.018a.885.885 0 01.127.062l.029.016.05.03c.01.004.018.01.027.015.017.011.034.021.05.033.009.005.018.012.026.018l.049.034.028.022.043.033.036.032a.819.819 0 01.1.092l8.26 8.26a1.865 1.865 0 010 2.637z"
      />
      {message === "messageA" && (
        <path
          fill="#E12229"
          d="M61.597 69.88c5.105 0 9.258-4.154 9.258-9.259s-4.153-9.258-9.258-9.258c-5.105 0-9.258 4.153-9.258 9.258 0 5.105 4.153 9.258 9.258 9.258zm0-20.009c5.927 0 10.75 4.822 10.75 10.75 0 5.927-4.823 10.75-10.75 10.75s-10.75-4.823-10.75-10.75c0-5.928 4.823-10.75 10.75-10.75zm2.306 7.878l5.155.75-3.73 3.636.88 5.136-4.611-2.425-4.611 2.424.88-5.134-3.73-3.638 5.155-.748 2.306-4.672 2.306 4.671z"
        />
      )}
      {message === "messageB" && (
        <path
          fill="#E12229"
          d="M61.597 51.363c-5.105 0-9.258 4.153-9.258 9.258 0 5.105 4.153 9.258 9.258 9.258 5.105 0 9.258-4.153 9.258-9.258 0-5.105-4.153-9.258-9.258-9.258zm0 20.007c-5.927 0-10.75-4.82-10.75-10.749 0-5.927 4.823-10.75 10.75-10.75s10.75 4.823 10.75 10.75c0 5.928-4.823 10.75-10.75 10.75zm3.357-16.563l3.357 5.814-3.357 5.814H58.24l-3.356-5.814 3.356-5.814h6.714z"
        />
      )}
      {message === "messageC" && (
        <path
          fill="#E12229"
          d="M61.597 69.88c5.105 0 9.258-4.154 9.258-9.259s-4.153-9.258-9.258-9.258c-5.105 0-9.258 4.153-9.258 9.258 0 5.105 4.153 9.258 9.258 9.258zm0-20.009c5.927 0 10.75 4.822 10.75 10.75 0 5.927-4.823 10.75-10.75 10.75s-10.75-4.823-10.75-10.75c0-5.928 4.823-10.75 10.75-10.75zM56.128 66.09V55.152h10.938V66.09H56.128z"
        />
      )}
      {message === "messageD" && (
        <path
          fill="#E12229"
          d="M61.597 69.88c5.105 0 9.258-4.154 9.258-9.259s-4.153-9.258-9.258-9.258c-5.105 0-9.258 4.153-9.258 9.258 0 5.105 4.153 9.258 9.258 9.258zm0-20.009c5.927 0 10.75 4.822 10.75 10.75 0 5.927-4.823 10.75-10.75 10.75s-10.75-4.823-10.75-10.75c0-5.928 4.823-10.75 10.75-10.75zm0 3.655l6.714 11.628H54.883l6.714-11.628z"
        />
      )}
      {message === "messageE" && (
        <path
          fill="#E12229"
          d="M61.597 69.88c5.105 0 9.258-4.154 9.258-9.259s-4.153-9.258-9.258-9.258c-5.105 0-9.258 4.153-9.258 9.258 0 5.105 4.153 9.258 9.258 9.258zm0-20.009c5.927 0 10.75 4.822 10.75 10.75 0 5.927-4.823 10.75-10.75 10.75s-10.75-4.823-10.75-10.75c0-5.928 4.823-10.75 10.75-10.75zm0 4.936a5.814 5.814 0 110 11.628 5.814 5.814 0 010-11.628z"
        />
      )}
      <path
        fill="#373B44"
        fillOpacity={0.3}
        d="M52.409 49.057l27.59-18.564-40 24.753-9.36-5.792-.338-.21L0 30.494l27.592 18.563L.925 79.183l28.727-28.74L40 57.406l10.349-6.963 28.726 28.74z"
      />
    </g>
  </svg>
);

export default SvgSendMessage;
