export type TkitAction<P> = { payload: P };

export function factory<
  N extends string,
  S extends {},
  R extends Record<
    string,
    (<A extends TkitAction<any>>(state: S, action: A) => S)
  >,
  E extends Record<
    string,
    (<A extends TkitAction<any>>(
      utils:
        {
          dispatch: TkitDispatch
        },
      action: A
    ) => void)
  >
>(
  model:
    {
      namespace: N,
      state: S,
      reducers: R,
      effects?: E
    }
) {

  type Actions = R & (
    typeof model.effects extends undefined ? {} : E
  );

  return model as unknown as {
    namespace: N;
    state: {
      [namespace in N]: S;
    };
    /** 生成 action */
    actions: {
      [action in keyof Actions]:
      (...action: [Exclude<Parameters<Actions[action]>[1], undefined>['payload']]) => {
        [Key in keyof ({
          type: `${N}/${Exclude<action, symbol>}`;
        } & Exclude<Parameters<Actions[action]>[1], undefined>)]: ({
          type: `${N}/${Exclude<action, symbol>}`;
        } & Exclude<Parameters<Actions[action]>[1], undefined>)[Key];
      }
    };
    /** 类型模板方法，请勿调用 */
    $actions: {
      [action in Exclude<keyof Actions, symbol> as `${N}/${action}`]:
      (...action: [Exclude<Parameters<Actions[action]>[1], undefined>] extends [never] ? [] : [Exclude<Parameters<Actions[action]>[1], undefined>]) => ReturnType<Actions[action]>
    }
  };
}

declare global {
  interface TkitReduxActions { }
  interface TkitDispatch {
    /** 请确保已引入相应的 NameSpace */
    <
      T extends keyof TkitReduxActions
      >(
      action:
        Parameters<TkitReduxActions[T]>[0] extends undefined ? {
          type: T
        } : {
          type: T,
          payload: Parameters<TkitReduxActions[T]>[0] extends TkitAction<infer P> ? P : never;
        }
    ): ReturnType<TkitReduxActions[T]>;
  }
}

export default factory;