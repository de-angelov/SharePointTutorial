import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneButton,
} from '@microsoft/sp-webpart-base';

import {
  SPHttpClient,
  SPHttpClientResponse,
} from '@microsoft/sp-http';

import {
  Environment,
  EnvironmentType,
} from '@microsoft/sp-core-library';


import { escape } from '@microsoft/sp-lodash-subset';

import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';

import MockHttpClient from './MockHttpClient';

export interface IHelloWorldWebPartProps {
  description: string;
  test: string;
  test1: boolean;
  test2: string;
  test3: boolean;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  private _renderList(items: ISPList[]):void {
    let html: string = '';
    items.forEach((item: ISPList) => {
      html += `
      <ul class="${styles.list}">
        <li class="${styles.listItem}">
          <span class="ms-font-1" >${item.Title}</span>
        </li>
      </ul>
      `;
    }) 
  }
  
  private _renderListAsync(): void {
    //local environment
    if (Environment.type === EnvironmentType.Local) {
      this._getMockListData().then((response) => {
        this._renderList(response.value);
      })
    }
    else if (Environment.type == EnvironmentType.SharePoint || Environment.type == EnvironmentType.ClassicSharePoint) {
      this._getListData()
        .then((response) => {
          this._renderList(response.value);
        });
    }
  }

  private _getMockListData(): Promise<ISPLists> {
    return MockHttpClient.get()
      .then((data: ISPList[]) => {
        let listData: ISPLists = { value: data };
        return listData;
      }) as Promise<ISPLists>;
  }

  private _getListData(): Promise<ISPLists> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + '/_api/web/lists?$filter=Hidden eq false',
      SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${ styles.helloWorld }">
        <div class="${ styles.container }">
          <div class="${ styles.row }">
            <div class="${ styles.column }">
              <span class="${ styles.title }">Welcome to SharePoint!</span>
              <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
              <p class="${ styles.description }">${escape(this.properties.description)}</p>
              <p class="${ styles.description }">${escape(this.properties.test)}</p>
              <p class="${ styles.description }">Loading from ${escape(this.context.pageContext.web.title)}</p>
              <a href="https://aka.ms/spfx" class="${ styles.button }">
                <span class="${ styles.label }">Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>`;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('test',{
                  label: 'Multy-line text field',
                  multiline: true,
                }),
                PropertyPaneCheckbox('test', {
                  text: 'Text',
                }),
                PropertyPaneDropdown('test1', {
                  label: 'Dropdown',
                  options: [
                    { key: '1', text: 'One'},
                    { key: '2', text: 'Two'},
                    { key: '3', text: 'Three'},
                    { key: '4', text: 'Four'},
                  ]
                }),
                PropertyPaneToggle('test3', {
                  label: 'Toggle',
                  onText: 'On',
                  offText: 'Off',
                })
                  
                  

              ]
            }
          ]
        }
      ]
    };
  }
}
