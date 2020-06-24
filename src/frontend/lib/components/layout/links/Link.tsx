// Based on https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/src/Link.tsx

/* eslint-disable jsx-a11y/anchor-has-content */

import MuiLink, { LinkProps as MuiLinkProps } from "@material-ui/core/Link";
import clsx from "clsx";
import { LinkProps as NextLinkProps } from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

import { Link as NextLink } from "../../../util/i18n";

type NextComposedProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  NextLinkProps;

const NextComposed = React.forwardRef<HTMLAnchorElement, NextComposedProps>((props, ref) => {
  const { as, href, replace, scroll, passHref, shallow, prefetch, ...other } = props;

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
    >
      <a ref={ref} {...other} />
    </NextLink>
  );
});

interface LinkPropsBase {
  activeClassName?: string;
  innerRef?: React.Ref<HTMLAnchorElement>;
  naked?: boolean;
}

export type LinkProps = LinkPropsBase & NextComposedProps & Omit<MuiLinkProps, "href">;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, activeClassName = "active", className: classNameProps, naked, ...other } = props;

  const router = useRouter();
  const pathname = typeof href === "string" ? href : href.pathname;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === pathname && activeClassName,
  });

  if (naked) {
    return <NextComposed className={className} ref={ref} href={href} {...other} />;
  }

  return (
    <MuiLink
      component={NextComposed}
      className={className}
      ref={ref}
      href={href as string}
      {...other}
    />
  );
});
