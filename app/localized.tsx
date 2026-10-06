"use client";
import {Children,cloneElement,isValidElement,type ReactNode,type ReactElement} from 'react';
import {useSiteLanguage,type Locale} from './site-language';
import {localizeText} from './localization';

function translateNode(node:ReactNode,locale:Locale):ReactNode {
  if(typeof node==='string')return localizeText(node,locale);
  if(Array.isArray(node))return Children.map(node,child=>translateNode(child,locale));
  if(!isValidElement(node))return node;
  const element=node as ReactElement<Record<string,unknown>>;
  // Leave native language names and quoted proper names as authored.
  if(element.props['data-localize']==='off')return node;
  const props:Record<string,unknown>={};
  for(const attr of ['title','placeholder','aria-label','aria-description','alt'])if(typeof element.props[attr]==='string')props[attr]=localizeText(element.props[attr] as string,locale);
  if(element.props.children!==undefined)props.children=translateNode(element.props.children as ReactNode,locale);
  return cloneElement(element,props);
}
export function Localized({children}:{children:ReactNode}){
  const {locale}=useSiteLanguage();
  return translateNode(children,locale);
}
