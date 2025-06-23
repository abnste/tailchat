import {
  isValidStr,
  model,
  registerWithUsername,
  showSuccessToasts,
  t,
  useAsyncFn,
  useAsyncRequest,
  getGlobalConfig,
  useWatch,
} from 'tailchat-shared';
import React, { useState } from 'react';
import { string } from 'yup';
import { Icon } from 'tailchat-design';
import { useNavigate } from 'react-router';
import { setUserJWT } from '../../utils/jwt-helper';
import { setGlobalUserLoginInfo } from '../../utils/user-helper';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useNavToView } from './utils';
import { EntryInput } from './components/Input';
import { SecondaryBtn } from './components/SecondaryBtn';
import { PrimaryBtn } from './components/PrimaryBtn';
import { TipIcon } from '@/components/TipIcon';

/**
 * 注册视图
 */
export const RegisterView: React.FC = React.memo(() => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [customNickname, setCustomNickname] = useState(false);
  const navigate = useNavigate();
  const navRedirect = useSearchParam('redirect');

  const [{ loading, error }, handleRegister] = useAsyncFn(async () => {
    await string()
      .required(t('用户名不能为空'))
      .min(2, t('用户名不能少于2个字符'))
      .max(20, t('用户名最长限制20个字符'))
      .matches(/^[A-Za-z0-9_\u4e00-\u9fa5]+$/, t('用户名只能包含中英文、数字和下划线'))
      .validate(username);

    await string()
      .min(6, t('密码不能低于6位'))
      .required(t('密码不能为空'))
      .max(40, t('密码最长限制40个字符'))
      .validate(password);

    const data = await registerWithUsername({
      username,
      password,
      nickname,
    });

    setGlobalUserLoginInfo(data);
    await setUserJWT(data.token);

    if (isValidStr(navRedirect)) {
      navigate(decodeURIComponent(navRedirect));
    } else {
      navigate('/main');
    }
  }, [username, nickname, password, navRedirect]);

      

  useWatch([username, customNickname], () => {
    if (!customNickname) {
      setNickname(username);
    }
  });

  const navToView = useNavToView();

  return (
    <div className="w-96 text-white">
      <div className="mb-4 text-2xl">{t('注册账号')}</div>

      <div>
        <div className="mb-4">
          <div className="mb-2">{t('用户名')}</div>
          <EntryInput
            name="reg-username"
            placeholder={t('请输入用户名')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4 relative">
          <div className="mb-2 flex items-center">
            <span className="mr-1">{t('昵称')}</span>
            <TipIcon content={t('后续在用户设置中可以随时修改')} />
          </div>
          <EntryInput
            name="reg-nickname"
            type="text"
            disabled={!customNickname}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <Icon
            className="absolute bottom-1 right-1 w-8 h-8 p-2 rounded cursor-pointer bg-opacity-20 bg-black z-10"
            icon={customNickname ? 'mdi:pencil-off' : 'mdi:pencil'}
            onClick={() =>
              setCustomNickname((customNickname) => !customNickname)
            }
          />
        </div>

        <div className="mb-4">
          <div className="mb-2">{t('密码')}</div>
          <EntryInput
            name="reg-password"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error.message}</p>}

        <PrimaryBtn loading={loading} onClick={handleRegister}>
          {t('注册账号')}
        </PrimaryBtn>

        <SecondaryBtn
          className="text-left"
          disabled={loading}
          onClick={() => navToView('/entry/login')}
        >
          <Icon icon="mdi:arrow-left" className="mr-1 inline" />
          {t('返回登录')}
        </SecondaryBtn>
      </div>
    </div>
  );
});
RegisterView.displayName = 'RegisterView';
